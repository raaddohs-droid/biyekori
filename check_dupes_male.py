import os
import hashlib
from collections import defaultdict

BATCH_DIR = r"C:\Users\tehsi\biyekori\Male Batch 3"

def md5(filepath):
    h = hashlib.md5()
    with open(filepath, "rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            h.update(chunk)
    return h.hexdigest()

hashes = defaultdict(list)

for root, dirs, files in os.walk(BATCH_DIR):
    for fname in files:
        if fname.lower().endswith((".jpg", ".jpeg", ".png", ".webp")):
            fpath = os.path.join(root, fname)
            hashes[md5(fpath)].append(fpath)

dupes = {h: paths for h, paths in hashes.items() if len(paths) > 1}
total = sum(len(v) for v in hashes.values())
dupe_count = sum(len(v) - 1 for v in dupes.values())

print(f"Total photos scanned: {total}")
print(f"Unique photos: {total - dupe_count}")
print(f"Duplicate files: {dupe_count}")
print()

if dupes:
    print("=== DUPLICATES ===")
    for h, paths in dupes.items():
        print(f"\nMD5: {h}")
        for p in paths:
            print(f"  {p}")
else:
    print("No duplicates found.")
