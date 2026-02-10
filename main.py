import pandas as pd
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import Model,Sequential
from tensorflow.keras.layers import Embedding,Conv1D,GlobalMaxPooling1D,Dense,Dropout,Input
from tensorflow.keras.preprocessing.text import Tokenizer
from tensorflow.keras.preprocessing.sequence import pad_sequences
from sklearn.metrics.pairwise import cosine_similarity
import re
def calculate_flames(name1,name2):
    n1=list(name1.lower().replace(" ",""))
    n2=list(name2.lower().replace(" ",""))
    for char in n1[:]:
        if char in n2:
            n1.remove(char)
            n2.remove(char)
    count=len(n1)+len(n2)
    flames=["F","L","A","M","E","S"]
    while len(flames)>1:
        split_idx=(count%len(flames))-1
        if split_idx>=0:
            flames=flames[split_idx+1:]+flames[:split_idx]
        else:
            flames=flames[:len(flames)-1]
    return flames[0]
FLAMES_RANK={'M':6,'L':5,'A':4,'F':3,'S':2,'E':1}
RANK_NAME={'M':'Marriage','L':'Love','A':'Affection','F':'Friend','S':'Sister','E':'Enemy'}
def smart_clean(text):
    if pd.isnull(text) or str(text).strip()=="":
        return "<MYSTERY>"
    text=str(text)
    text=re.sub(r'([^\w\s])',r'\1',text)
    return " ".join(text.split())
def load_and_prep(filepath):
    df=pd.read_csv(filepath)
    df['processed_text']=df['Pickup Line/Feeling'].apply(smart_clean)
    def categorize(t):
        if "<MYSTERY>" in t: return 0
        if any(c in t for c in "❤️🩷🧡💛💚💙💜🖤🤍🤎💔❣️💕💞💓💗💖💘💝"): return 1
        if "?" in t: return 2
        return 3
    df['label']=df['processed_text'].apply(categorize)
    df['timestamp']=pd.to_datetime(df['Submitted At'],format="%d/%m/%Y,%I:%M:%S %p",errors='coerce')
    return df
def train_model(df):
    tokenizer=Tokenizer(num_words=2000,filter='',lower=False,oov_token="<OOV")
    tokenizer.fit_on_texts(df['processed_text'])
    sequences=tokenizer.texts_to_sequence(df['processed_text'])
    max_len=max([len(x) for x in sequences])
    padded_seq=pad_sequences(sequences,maxlen=max_len,padding='post')
    labels=np.array(df['Label'])

    input_layer=Input(shape=(max_len,))
    x=Embedding(input_dim=2000,output_dim=16)(input_layer)
    x=Conv1D(filters=32,kernel_size=3,activation='relu',padding='same')(x)
    x=GlobalMaxPooling1D()(x)
    
    personality_layer=Dense(16,activation='relu',name='personality_vector')(x)
    output_layer=Dense(4,activation='softmax')(personality_layer)
    model=Model(inputs=input_layer,outputs=output_layer)
    model.compile(optimizer='adam',loss='sparse_categorical_crossentropy',metrics=['accuracy'])
    print("Training AI")
    model.fit(padded_seq,labels,epochs=30,verbose=0)
    extractor=Model(inputs=model.input,outputs=model.get_layer('personality_vector').output)
    return extractor,tokenizer,max_len
def find_best_match(user_row,all_df,model,tokenizer,max_len):
    user_name=user_row['Name']
    user_gender=user_row['Gender']
    target_gender=user_row['Target Gender']
    u_seq=tokenizer.texts_to_sequences([user_row['processed_text']])
    u_pad=pad_sequences(u_seq,maxlen=max_len,padding='post')
    u_vector=model.predict(u_pad,verbose=0)
    candidates=all_df[
        (all_df['Gender'].str.lower()==str(target_gender).lower())&(all_df['Target Gender'].str.lower()==str(user_gender).lower())&(all_df['Name']!=user_name)].copy()
    if candidates.empty:
        return "No Match","-","Forever Alone",0.0
    c_seq=tokenizer.texts_to_sequences(candidates['processed_text'])
    c_pad=pad_sequences(c_seq,maxlen=max_len,padding='post')
    c_vectors=model.predict(c_pad,verbose=0)

    candidates['ai_score']=cosine_similarity(u_vector,c_vectors)[0]
    def get_time_score(c_row):
        if pd.isnull(user_row['timestamp']) or pd.isnull(c_row['timestamp']): return 0
        diff=abs((user_row['timestamp']-c_row['timestamp']).total_seconds()/60)
        return 100/(1+diff)
    candidates['time_score']=candidates.apply(get_time_score,axis=1)
    candidates['final_score']=(candidates['ai_score']*0.08)+(candidates['time_score']*0.01)
    cluster=candidates.sort_values(by='final_score',ascending=False).head(3)
    best_match=None
    best_power=1
    best_relation="Unknown"
    for _,row in cluster.iterrows():
        f_res=calculate_flames(user_name,row['Name'])
        f_rank=FLAMES_RANK[f_res]
        power=f_rank+row['ai_score']
        if power>best_power:
            best_power=power
            best_match=row
            best_relation=RANK_NAME[f_res]
    return best_match['Name'],best_match['Class'],best_relation,best_power
input_file='tinker_hearts.csv' #change file name to what the latest file name is
print(f"Loading Data from {input_file}")
df=load_and_prep(input_file)
model,tokenizer,max_len=train_model(df)
print("Processing matches")
results=[]
for index,row in df.iterrows():
    match_name,match_class,relation,power=find_best_match(row,df,model,tokenizer,max_len)
    results.append({
        'Seeker Name':row['Name'],
        'Seeker Class':row['Class'],
        'Matched With':match_name,
        'Match Class':match_class,
        'Relationship Type':relation,
        'Compatibility Score':round(power,2),
        'Seeker Line':row['Pickup Line/Feeling']
    })
output_file='tinker_hearts_connections.csv'
results_df=pd.DataFrame(results)
results_df.to_csv(output_file,index=False)
print(f"\n Success! Matches saved to :{output_file}")
print(results_df.head())
