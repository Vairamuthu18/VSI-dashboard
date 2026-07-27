import json
import random
from datetime import datetime, timedelta
import os

QUERIES = [
    "generative ai solutions for enterprises",
    "intelligent document processing automation services",
    "ai strategy and digital transformation consulting",
    "predictive analytics and machine learning development company",
    "custom autonomous ai agents development services"
]
BRAND = "Tatras"
LOCATION = "us"
PLATFORMS = ["ChatGPT", "Gemini", "Perplexity", "Claude", "Microsoft Copilot"]

# Load existing data
with open('data/ai_queries.json', 'r') as f:
    queries_data = json.load(f)

with open('data/ai_responses.json', 'r') as f:
    responses_data = json.load(f)

# Find max IDs
max_q_id = 0
for q in queries_data:
    if q['id'].startswith('q'):
        try:
            num = int(q['id'][1:])
            if num > max_q_id:
                max_q_id = num
        except ValueError:
            pass

max_r_id = 0
for r in responses_data:
    if r['id'].startswith('r'):
        try:
            num = int(r['id'][1:])
            if num > max_r_id:
                max_r_id = num
        except ValueError:
            pass

q_counter = max_q_id + 1
r_counter = max_r_id + 1

START_DATE = datetime(2025, 11, 1)
END_DATE = datetime(2026, 2, 24)

def random_date(start, end):
    return start + timedelta(seconds=random.randint(0, int((end - start).total_seconds())))

print(f"Adding {len(QUERIES)} queries for {BRAND}...")

for query_text in QUERIES:
    q_id = f"q{q_counter:03d}"
    q_counter += 1
    
    timestamp = random_date(START_DATE, END_DATE)
    
    # Create Query Entry
    q_entry = {
        "id": q_id,
        "query": query_text,
        "brand_name": BRAND,
        "location": LOCATION,
        "created_at": timestamp.strftime("%Y-%m-%d %H:%M:%S"),
        "status": "Checked"
    }
    queries_data.append(q_entry)
    
    # Generate Responses for this query (2-4 platforms)
    selected_platforms = random.sample(PLATFORMS, k=random.randint(2, 4))
    
    for plat in selected_platforms:
        r_id = f"r{r_counter:03d}"
        r_counter += 1
        
        mention_chance = 0.8
        brand_mentioned = random.random() < mention_chance
        
        sentiment = "neutral"
        if brand_mentioned:
            val = random.random()
            if val < 0.6: sentiment = "positive"
            elif val < 0.9: sentiment = "neutral"
            else: sentiment = "negative"
        
        # Competitors
        pool = ["SalesboxAI", "OrbitAI", "NexusFlow", "HubSpot", "Semrush", "Ahrefs"]
        mentioned_comps = random.sample(pool, k=random.randint(0, 3))
        
        position = random.randint(1, 10) if brand_mentioned else 0
        
        r_entry = {
            "id": r_id,
            "prompt_id": q_id,
            "platform": plat,
            "test_date": timestamp.strftime("%Y-%m-%d"),
            "brand_mentioned": brand_mentioned,
            "position": position,
            "sentiment": sentiment,
            "competitors_mentioned": mentioned_comps,
            "response_text": f"Response regarding {query_text} on {plat}... Mentioned {BRAND}: {brand_mentioned}."
        }
        responses_data.append(r_entry)

# Write files
with open('data/ai_queries.json', 'w') as f:
    json.dump(queries_data, f, indent=4)

with open('data/ai_responses.json', 'w') as f:
    json.dump(responses_data, f, indent=4)

print(f"Successfully added. Total queries: {len(queries_data)}. Total responses: {len(responses_data)}.")
