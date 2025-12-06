import pandas as pd
from mp_api.client import MPRester
import os
from dotenv import load_dotenv

load_dotenv()
# REPLACE THIS with your actual API key from Materials Project
MAPI_KEY = os.getenv("KEY-1")

print("Connecting to Materials Project...")

with MPRester(MAPI_KEY) as mpr:
    # We want to find materials that are likely Perovskites or similar.
    # We ask for: formula, band_gap, and structure.
    # We limit to 1000 entries for this demo.
    docs = mpr.summary.search(
        fields=["material_id", "formula_pretty", "band_gap", "structure"],
        num_chunks=25, 
        chunk_size=1000
    )

data = []
for doc in docs:
    data.append({
        "material_id": doc.material_id,
        "formula": doc.formula_pretty,
        "band_gap": doc.band_gap,
        "structure": doc.structure # This contains the 3D lattice data
    })

df = pd.DataFrame(data)

# Filter: Clean out metals (Band gap = 0) if we only want semiconductors
# But keeping them helps the model learn what NOT to pick.
print(f"Fetched {len(df)} materials.")
print(df.head())


#CSV
df.to_csv("materials_info.csv", index=False)
print("Data saved to 'materials_info.csv'")

# Save for the ML step
# We pickle it because 'structure' is a complex Python object, not just text.
df.to_pickle("materials_info.pkl")
print("Data saved to 'materials_info.pkl'")
