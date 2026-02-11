import pandas as pd
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import Model,Sequential
from tensorflow.keras.layers import Embedding,Conv1D,GlobalMaxPooling1D,Dense,Dropout,Input
from tensorflow.keras.preprocessing.text import Tokenizer
from tensorflow.keras.preprocessing.sequence import pad_sequences
from sklearn.metrics.pairwise import cosine_similarity
import re
import time
from deep_translator import GoogleTranslator
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
def translate_to_english(text):
    if pd.isnull(text) or str(text).strip()=="":
        return "Nothing"
    try:
        translated=GoogleTranslator(source='auto',target='en').translate(str(text))
        return translated
    except Exception as e:
        return str(text)
def smart_clean(text):
    if pd.isnull(text) or str(text).strip()=="":
        return "<MYSTERY>"
    text=str(text)
    text=re.sub(r'([^\w\s])',r' \1 ',text)
    return " ".join(text.split())
def load_and_prep(filepath):
    df=pd.read_csv(filepath)
    df.columns=df.columns.str.strip()
    df['Gender']=df['Gender'].astype(str).str.strip()
    df['Target Gender']=df['Target Gender'].astype(str).str.strip()
    df['translated_text']=df['Pickup Line/Feeling'].apply(translate_to_english)
    df['processed_text']=df['translated_text'].apply(smart_clean)
    def categorize(t):
        if "<MYSTERY>" in t: return 0
        if any(c in t for c in "❤️🩷🧡💛💚💙💜🖤🤍🤎💔❣️💕💞💓💗💖💘💝"): return 1
        if "?" in t: return 2
        return 3
    df['label']=df['processed_text'].apply(categorize)
    df['timestamp']=pd.to_datetime(df['Submitted At'],format="%d/%m/%Y, %I:%M:%S %p",errors='coerce')
    return df
def train_model(df):
    tokenizer=Tokenizer(num_words=2000,filters='',lower=False,oov_token="<OOV>")
    tokenizer.fit_on_texts(df['processed_text'])
    sequences=tokenizer.texts_to_sequences(df['processed_text'])
    max_len=max([len(x) for x in sequences])if sequences else 10
    padded_seq=pad_sequences(sequences,maxlen=max_len,padding='post')
    labels=np.array(df['label'])
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
def find_unique_matches(df,model,tokenizer,max_len):
    print("Calculating AI Vectors")
    all_seq=tokenizer.texts_to_sequences(df['processed_text'])
    all_pad=pad_sequences(all_seq,maxlen=max_len,padding='post')
    all_vectors=model.predict(all_pad,verbose=0)
    potential_matches=[]
    ids=df.index.tolist()
    print("Analyzing all relations")
    for i in range(len(ids)):
        for j in range(i+1,len(ids)):
            idx_a=ids[i]
            idx_b=ids[j]
            user_a=df.loc[idx_a]
            user_b=df.loc[idx_b]
            a_gender=str(user_a['Gender']).strip().lower()
            a_target=str(user_a['Target Gender']).strip().lower()
            b_gender=str(user_b['Gender']).strip().lower()
            b_target=str(user_b['Target Gender']).strip().lower()
            valid_a_to_b=(a_target=="endhelum-madhi")or(a_target==b_gender)
            valid_b_to_a=(b_target=="endhelum-madhi")or(b_target==a_gender)
            if valid_a_to_b and valid_b_to_a:
                vec_a=all_vectors[i].reshape(1,-1)
                vec_b=all_vectors[j].reshape(1,-1)
                ai_score=cosine_similarity(vec_a,vec_b)[0][0]
                time_score=0
                if pd.notnull(user_a['timestamp']) and pd.notnull(user_b['timestamp']):
                    diff=abs((user_a['timestamp']-user_b['timestamp']).total_seconds()/60)
                    time_score=100/(1+diff)
                f_res=calculate_flames(user_a['Name'],user_b['Name'])
                f_rank=FLAMES_RANK[f_res]
                power=f_rank+(ai_score*0.8)+(time_score*0.01)
                potential_matches.append({
                    'u1_idx':idx_a,'u2_idx':idx_b,
                    'u1_name':user_a['Name'],'u2_name':user_b['Name'],
                    'u2_class':user_b['Class'],'u1_class':user_a['Class'],
                    'relation':RANK_NAME[f_res],'power':power
                })
    potential_matches.sort(key=lambda x:x['power'],reverse=True)
    taken=set()
    final_results={}
    for pm in potential_matches:
        if pm['u1_idx'] not in taken and pm['u2_idx'] not in taken:
            taken.add(pm['u1_idx'])
            taken.add(pm['u2_idx'])
            final_results[pm['u1_idx']]={
                "Matched With":pm['u2_name'],"Match Class":pm['u2_class'],
                "Relationship Type":pm['relation'],"Compatibility Score":pm['power']
            }
            final_results[pm['u2_idx']]={
                "Matched With":pm['u1_name'],"Match Class":pm['u1_class'],
                "Relationship Type":pm['relation'],"Compatibility Score":pm['power']
            }
    return final_results
input_file='tinker_hearts_2026-02-10.csv'
print(f"Loading Data from {input_file}")
df=load_and_prep(input_file)
model,tokenizer,max_len=train_model(df)
print("Processing matches")
matches_map=find_unique_matches(df,model,tokenizer,max_len)
results=[]
for index,row in df.iterrows():
    if index in matches_map:
        match_data=matches_map[index]
        match_name=match_data['Matched With']
        match_class=match_data['Match Class']
        relation=match_data['Relationship Type']
        power=match_data['Compatibility Score']
    else:
        match_name='No Match'
        match_class="-"
        relation='Forever Alone'
        power=0.0
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