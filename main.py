import pandas as pd
import numpy as np
from sentence_transformers import SentenceTransformer
from transformers import pipeline
from sklearn.metrics.pairwise import cosine_similarity
print("Loading Semantic Model (all-MiniLM-L6-v2)...")
embedder = SentenceTransformer('all-MiniLM-L6-v2') 

print("Loading Emotion Model (roberta-base-go_emotions)...")
classifier = pipeline("text-classification", model="SamLowe/roberta-base-go_emotions", top_k=1)

def get_flames_result(name1, name2):
    n1, n2 = name1.lower().replace(" ", ""), name2.lower().replace(" ", "")
    for char in n1[:]:
        if char in n2:
            n1 = n1.replace(char, "", 1)
            n2 = n2.replace(char, "", 1)
    
    count = len(n1) + len(n2)
    if count == 0: return "Destiny"
    outcomes = ["Enmity", "Siblings", "Friends", "Affection", "Marriage", "Lovers"]
    return outcomes[count % len(outcomes)]

def process_vibe_matches(file_path, output_path):
    df = pd.read_csv(file_path)
    print(f"Generating vibes for {len(df)} users...")
    vectors = embedder.encode(df['text_input'].tolist())
    
    results = []

    for i, row in df.iterrows():
        current_vec = vectors[i].reshape(1, -1)
        current_user = row['username']
        mask = df.index != i
        sim_scores = cosine_similarity(current_vec, vectors[mask])[0]
        other_users = df[mask].reset_index()
        
        max_sim = np.max(sim_scores)
        tie_indices = np.where(sim_scores == max_sim)[0]
        
        if len(tie_indices) > 1:
            best_outcome_val = -1
            final_match = ""
            for idx in tie_indices:
                potential_match = other_users.iloc[idx]['username']
                outcome = get_flames_result(current_user, potential_match)
                rank = ["Enmity", "Siblings", "Friends", "Affection", "Marriage", "Lovers"].index(outcome)
                if rank > best_outcome_val:
                    best_outcome_val = rank
                    final_match = potential_match
        else:
            final_match = other_users.iloc[np.argmax(sim_scores)]['username']
        emotion = classifier(row['text_input'])[0][0]['label']

        results.append({
            "username": current_user,
            "text_input": row['text_input'],
            "match": final_match,
            "score": round(max_sim * 100, 1),
            "primary_aura": emotion,
            "fate_status": get_flames_result(current_user, final_match)
        })
    pd.DataFrame(results).to_csv(output_path, index=False)
    print(f" Success! Results saved to {output_path}")
process_vibe_matches('input_vibe.csv', 'matched_results.csv')