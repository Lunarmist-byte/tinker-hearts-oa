import pandas as pd
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import Model
from tensorflow.keras.layers import Embedding,Conv1D,GlobalMaxPooling1D,Dense,Input
from tensorflow.keras.preprocessing.text import Tokenizer
from tensorflow.keras.preprocessing.sequence import pad_sequences
from sklearn.metrics.pairwise import cosine_similarity
import re
from deep_translator import GoogleTranslator

def calculate_flames(n1,n2):
    n1,n2=list(n1.lower().replace(" ","")),list(n2.lower().replace(" ",""))
    for c in n1[:]:
        if c in n2:n1.remove(c); n2.remove(c)
    f=["F","L","A","M","E","S"]
    count=len(n1)+len(n2)
    while len(f)>1:
        idx=(count%len(f))-1
        if idx>=0: f=f[idx+1:]+f[:idx]
        else: f=f[:len(f)-1]
    ranks={'M':6,'L':5,'A':4,'F':3,'S':2,'E':1}
    return ranks[f[0]]*0.001
def normalize_gender(g):
    g=str(g).strip().lower()
    if g in ['m','male','man','boy']: return 'male'
    if g in ['f','female','woman','girl']: return 'female'
    return 'any'
def translate_to_english(text):
    if pd.isnull(text) or str(text).strip()=="":return 'Nothing' 
    try: return GoogleTranslator(source='auto',target='en').translate(str(text))
    except: return str(text)
def smart_clean(text):
    text=re.sub(r'([^\w\s])',r'\1',str(text)) if pd.notnull(text) else "<MYSTERY>"
    return " ".join(text.split())
def calculate_effort(text):
    s=str(text).strip().lower()
    if not s or s in ["<mystery>","nothing","onnulla","nil","no","nan"]:
        return 0.1
    if not re.search('[a-zA-Z]',s):
        return 0.2
    if len(s)<3:
        return 0.3
    return 1.0
def load_and_prep(filepath):
    df=pd.read_csv(filepath)
    df.columns=df.columns.str.strip()
    df['Gender']=df['Gender'].apply(normalize_gender)
    print("Activaing Neural Network")
    df['translated_text']=df['Pickup Line/Feeling'].apply(translate_to_english)
    df['processed_text']=df['translated_text'].apply(smart_clean)
    df['effort_score']=df['processed_text'].apply(calculate_effort)
    df['label']=df['processed_text'].apply(lambda x:0 if "<MYSTERY>" in x else 1)
    df['timestamp']=pd.to_datetime(df['Submitted At'],format="%d/%m/%Y, %I:%M:%S %p",errors='coerce')
    return df
def train_model(df):
    tokenizer=Tokenizer(num_words=3000,filters='',lower=False,oov_token="<OOV>")
    tokenizer.fit_on_texts(df['processed_text'])
    seq=tokenizer.texts_to_sequences(df['processed_text'])
    max_len=max([len(x)for x in seq]) if seq else 10
    pad=pad_sequences(seq,maxlen=max_len,padding='post')
    inp=Input(shape=(max_len,))
    x=Embedding(3000,16)(inp)
    x=Conv1D(32,3,activation='relu',padding='same')(x)
    x=GlobalMaxPooling1D()(x)
    soul_vector=Dense(16,activation='relu',name='soul_vector')(x)
    out=Dense(2,activation='softmax')(soul_vector)

    model=Model(inp,out)
    model.compile(optimizer='adam',loss='sparse_categorical_crossentropy',metrics=['accuracy'])
    print("Trainig Neural Network")
    model.fit(pad,np.array(df['label']),epochs=50,verbose=0)
    encoder=Model(inp,soul_vector)
    return encoder,tokenizer,max_len
def solve_matrix(df,model,tokenizer,max_len):
    n=len(df)
    print("Computing Compatibility Tensor for {n} users")
    seq=tokenizer.texts_to_sequences(df['processed_text'])
    pad=pad_sequences(seq,maxlen=max_len,padding='post')
    soul_matrix=model.predict(pad,verbose=0)
    sim_matrix=cosine_similarity(soul_matrix)*10.0
    genders=df['Gender'].values
    gender_mask=(genders[:None]!=genders[None,:]).astype(float)
    efforts=df['effort_score'].values
    effort_matrix=efforts[:,None]*efforts[None,:]
    names=df['Name'].values
    flames_tiebreaker=np.zeros((n,n))
    for i in range(n):
        for j in range(n):
            if i!=j:
                flames_tiebreaker[i,j]=calculate_flames(names[i],names[j])
    final_score_matrix=(sim_matrix+flames_tiebreaker)*gender_mask*effort_matrix
    np.fill_diagonal(final_score_matrix,-999)
    matches={}
    taken=set()
    print("Optimizing Connections")
    while len(taken)<n:
        flat_idx=np.argmax(final_score_matrix)
        i,j=np.unravel_index(flat_idx,(n,n))
        max_val=final_score_matrix[i,j]
        if max_val<=0:break
        if i not in taken and j not in taken:
            taken.add(i); taken.add(j)
            raw_score=(sim_matrix[i,j]+flames_tiebreaker[i,j])
            base_score=int(raw_score)
            if base_score>=9: status="Soulmates forever ♾️"
            elif base_score>=8: status="Perfect Match🔥"
            elif base_score>=6: status="Great Vibe✨"
            elif base_score>=4: status="Potential💭" 
            else: status='Arranged Marriage 🤝'
            matches[i]={'With':names[j],'Class':df.iloc[j]['Class'],'Type':status,'Score':raw_score}
            matches[j]={'With':names[i],'Class':df.iloc[i]['Class'],'Type':status,'Score':raw_score}
            final_score_matrix[i,:]=-999,final_score_matrix[:,i]=-999
            final_score_matrix[j,:]=-999,final_score_matrix[:,j]=-999
        else:
            final_score_matrix[i,j]=-999
    return matches
input_file='tinker_hearts.csv'
print("Loading:{input_file}")
df=load_and_prep(input_file)
model,tokenizer,max_len=train_model(df)
match_map=solve_matrix(df,model,tokenizer,max_len)
final_data=[]
for idx,row in df.iterrows():
    if idx in match_map:
        m=match_map[idx]
        final_data.append({
            'User':row['Name'],'User Class':row['Class'],'Matched With':m['With'],'Match Class':m['Class'],'Status':m['Type'],'Compat. Score':round(m['Score'],2),'Bio':row['Pickup Line/Feeling']})
    else:
        final_data.append({'User':row['Name'],'User Class':row['Class'],'Matched With':m['With'],'Match Class':m['Class'],'Status':m['Type'],'Compat. Score':round(m['Score'],2),'Bio':row['Pickup Line/Feeling']})
out_file='tinker_hearts_connections.csv'
pd.DataFrame(final_data).to_csv(out_file,index=False,encoding='utf-8-sig')
print(f"Matching Complete. Data Written to {out_file}")
