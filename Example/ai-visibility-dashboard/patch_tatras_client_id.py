import json

with open('data/ai_queries.json', 'r') as f:
    queries_data = json.load(f)

updated = 0
for q in queries_data:
    if q.get('brand_name') == 'Tatras':
        q['client_id'] = 'u008'
        updated += 1

with open('data/ai_queries.json', 'w') as f:
    json.dump(queries_data, f, indent=4)

print(f"Updated {updated} queries with client_id u008.")
