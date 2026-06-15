'''def get_text_chunks(text, chunk_size=800, chunk_overlap=100):
    """
    Yeh function bade text ko chhote chunks mein todta hai.
    Overlap isliye rakha hai taaki sentence beech mein tootne par meaning na badle.
    """
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end])
        # Agla chunk thoda pichle chunk ke end se shuru hoga (overlap)
        start += chunk_size - chunk_overlap
    return chunks
'''
from sentence_transformers import SentenceTransformer

# AI model load kar rahe hain (Pehli baar chalne par yeh thoda time lega)
model = SentenceTransformer('all-MiniLM-L6-v2')

def get_text_chunks(text, chunk_size=800, chunk_overlap=100):
    """
    Text ko chhote chunks mein todta hai.
    """
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end])
        start += chunk_size - chunk_overlap
    return chunks

def get_embedding(text):
    """
    Text ko numbers (vector) ki list mein convert karta hai.
    """
    # .tolist() lagana zaruri hai taaki MongoDB in numbers ko save kar sake
    return model.encode(text).tolist()    