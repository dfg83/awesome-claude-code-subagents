# Hybrid Search & Contextual Retrieval: Die Zukunft der KI-gestützten Informationssuche

## Einleitung

Die Art und Weise, wie KI-Systeme Informationen abrufen und verarbeiten, durchläuft derzeit eine fundamentale Transformation. Während einfache semantische Suche lange Zeit als Goldstandard galt, zeigen neue Entwicklungen deutlich: Die Kombination verschiedener Suchmethoden – sogenanntes **Hybrid Search** – kombiniert mit **Contextual Retrieval** und **Reranking** liefert deutlich präzisere Ergebnisse. Dieser Artikel beleuchtet die wichtigsten Konzepte, Techniken und Best Practices für moderne RAG-Systeme (Retrieval-Augmented Generation).

---

## Was ist Hybrid Search?

### Das Problem mit rein semantischer Suche

Reine Vektorsuche basiert auf **Embeddings** – numerischen Repräsentationen, die semantische Beziehungen zwischen Wörtern erfassen. Sie funktioniert hervorragend für:
- Umgangssprachliche Anfragen mit Tippfehlern
- Konzeptionelle Ähnlichkeiten (z.B. "Hund" und "Welpe")
- Explorative Suchanfragen

Allerdings hat sie erhebliche Schwächen bei:
- **Exakten Treffern**: Abkürzungen wie "GAN" oder "LLaMA" gehen verloren
- **Namen und IDs**: Spezifische Bezeichnungen wie "Biden" oder "Error Code TS-999"
- **Code-Snippets**: Programmiercode erfordert präzise Übereinstimmung

### Die Lösung: Kombination aus Keyword- und Vektor-Suche

**Hybrid Search** kombiniert die Stärken beider Ansätze:

| Suchmethode | Stärken | Schwächen |
|-------------|---------|-----------|
| **Keyword-Suche (BM25)** | Präzise Treffer, exakte Begriffe, schnell | Kein Verständnis für Synonyme oder Kontext |
| **Semantische Suche** | Versteht Bedeutung, Synonyme, Konzepte | Kann exakte Begriffe übersehen |
| **Hybrid Search** | Beides: Präzision + semantisches Verständnis | Höhere Latenz, komplexere Implementierung |

---

## Technische Grundlagen

### BM25: Die Keyword-Suche

BM25 (Best Match 25) ist ein optimierter Ranking-Algorithmus basierend auf TF-IDF:

```
BM25(D,Q) = Σ IDF(q) · [TF(q,D) · (k₁ + 1)] / [TF(q,D) + k₁ · (1 - b + b · |D|/avgdl)]
```

**Komponenten:**
- **TF (Term Frequency)**: Wie oft erscheint der Begriff im Dokument?
- **IDF (Inverse Document Frequency)**: Wie selten ist der Begriff insgesamt?
- **k₁, b**: Tunable Parameter für Feinabstimmung

### Vektor-Suche mit Embeddings

Dense Vektorsuche verwendet Machine Learning-Modelle wie BERT, um Text in hochdimensionale Vektorräume zu transformieren:

```python
# Beispiel: Cosine Similarity
similarity = (A · B) / (||A|| · ||B||)
```

Ähnliche Inhalte liegen im Vektorraum nah beieinander, unabhängig von den verwendeten Wörtern.

### Fusion-Methoden

#### 1. Reciprocal Rank Fusion (RRF)

RRF ignoriert Roh-Scores und fokussiert auf die Position in den Rankings:

```
RRF(d) = Σ 1 / (k + r(d))
```

**Vorteile:**
- Keine Normalisierung nötig
- Funktioniert mit unterschiedlichen Score-Ranges
- Einfach zu implementieren
- Fördert Diversität in den Top-Ergebnissen

#### 2. Lineare Kombination

Kombiniert normalisierte Scores mit Gewichten:

```
H = (1-α) · K + α · V
```

- α = 0: Reine Keyword-Suche
- α = 1: Reine Vektor-Suche
- 0 < α < 1: Gewichtete Kombination

**Vorteile:** Feingranulare Kontrolle, kann externe Signale integrieren
**Nachteile:** Erfordert Tuning und Normalisierung

---

## Contextual Retrieval: Kontext ist König

### Das Kontext-Problem in traditionellem RAG

Beim klassischen RAG werden Dokumente in kleine Chunks aufgeteilt. Das führt zu einem kritischen Problem: **Kontextverlust**.

**Beispiel:**
```
Original Chunk: "Der Umsatz des Unternehmens wuchs um 3% gegenüber dem Vorquartal."

Problem: Welches Unternehmen? Welches Quartal? Welcher Zeitraum?
```

### Die Lösung: Contextual Embeddings

**Contextual Retrieval** fügt jedem Chunk einen erklärenden Kontext hinzu:

```
Kontextualisierter Chunk: 
"Dieser Abschnitt stammt aus einer SEC-Einreichung zu ACME Corps Performance in Q2 2023; 
der Umsatz des Vorquartals betrug 314 Millionen Dollar. Der Umsatz des Unternehmens wuchs 
um 3% gegenüber dem Vorquartal."
```

### Implementierung mit Claude

Anthropic empfiehlt folgenden Prompt zur Kontextgenerierung:

```xml
<document>
{{GESAMTES_DOKUMENT}}
</document>

Hier ist der Chunk, den wir im Kontext des gesamten Dokuments einordnen möchten:
<chunk>
{{CHUNK_INHALT}}
</chunk>

Bitte gib einen kurzen, prägnanten Kontext an, um diesen Chunk im Gesamtdokument 
zu verorten, um die Suchtreffer zu verbessern. Antworte nur mit dem prägnanten 
Kontext und nichts anderem.
```

### Performance-Gewinne

Anthropics Experimente zeigen beeindruckende Ergebnisse:

| Methode | Reduktion der Fehlertreffer |
|---------|----------------------------|
| Contextual Embeddings allein | -35% |
| Contextual Embeddings + Contextual BM25 | -49% |
| + Reranking | **-67%** |

---

## Reranking: Die Feinabstimmung

### Warum Reranking?

Die initiale Retrieval-Phase liefert oft hunderte potenziell relevanter Chunks – aber nicht alle sind gleich wichtig. Reranking filtert die besten heraus.

### Ablauf

1. **Initiale Retrieval**: Top-150 Chunks abrufen (via Hybrid Search)
2. **Reranking**: Jedem Chunk wird ein Relevanz-Score zugewiesen
3. **Selektion**: Nur die Top-K Chunks (z.B. 20) werden ans LLM weitergegeben

### Vorteile

- **Bessere Antworten**: Nur hochrelevante Informationen fließen ein
- **Niedrigere Kosten**: Weniger Tokens für das LLM
- **Geringere Latenz**: Kompakterer Kontext

### Verfügbare Reranker

- **Cohere Rerank**: Etablierte Lösung, gut getestet
- **Voyage Rerank**: Alternative mit Fokus auf Embedding-Qualität

---

## Praxisbeispiel: Stack Overflow

Stack Overflow hat sein Suchsystem von rein lexikalischer Suche (TF-IDF) auf **Hybrid Search** umgestellt:

**Vorher:**
- Exakte Keyword-Matches
- Code-Snippets mussten exakt übereinstimmen
- Semantisch ähnliche Posts wurden verpasst

**Nachher:**
- Kombination aus semantischer und lexikalischer Suche
- Code-Snippets werden exakt gematcht
- Konzeptionell ähnliche Inhalte werden gefunden

**Ergebnis**: Deutlich verbesserte Suchergebnisse und Nutzerzufriedenheit.

---

## Implementierung: Code-Beispiel

### Mit LangChain und ChromaDB

```python
from langchain.retrievers import BM25Retriever, EnsembleRetriever
from langchain.vectorstores import Chroma

# 1. Retriever erstellen
vectorstore_retriever = vectorstore.as_retriever(search_kwargs={"k": 3})
keyword_retriever = BM25Retriever.from_documents(chunks)
keyword_retriever.k = 3

# 2. Hybrid Retriever (Ensemble)
ensemble_retriever = EnsembleRetriever(
    retrievers=[vectorstore_retriever, keyword_retriever],
    weights=[0.3, 0.7]  # α = 0.3 für Vektor, 0.7 für Keywords
)

# 3. RAG Chain
from langchain.chains import RetrievalQA

hybrid_chain = RetrievalQA.from_chain_type(
    llm=llm,
    chain_type="stuff",
    retriever=ensemble_retriever
)
```

### Mit Weaviate (native Hybrid Search)

```python
from langchain.retrievers.weaviate_hybrid_search import WeaviateHybridSearchRetriever

retriever = WeaviateHybridSearchRetriever(
    alpha=0.5,  # 0 = reine Keywords, 1 = reine Vektoren
    client=client,
    index_name="Dokumente",
    text_key="content"
)
```

---

## Best Practices & Empfehlungen

### 1. Starte mit RRF

Reciprocal Rank Fusion ist der beste Einstieg:
- Keine Normalisierung nötig
- Funktioniert out-of-the-box
- Nur ein Parameter zu tunen (`rank_constant`)

### 2. Experimentiere mit Chunk-Größen

- Kleinere Chunks (200-400 Tokens): Präziser, aber weniger Kontext
- Größere Chunks (800+ Tokens): Mehr Kontext, aber potenziell mehr Noise
- Überlappung: 10-20% zwischen Chunks für Kontinuität

### 3. Wähle das richtige Embedding-Modell

Tests zeigen: **Gemini Text 004** und **Voyage** liefern die besten Ergebnisse für Contextual Retrieval.

### 4. Nutze Prompt Caching

Für Contextual Retrieval: Lade Dokumente einmal in den Cache und referenziere sie für alle Chunks. Das reduziert Kosten um bis zu 90%.

### 5. Evaluiere immer

Ohne Messung keine Verbesserung. Metriken:
- **Recall@K**: Wie viele relevante Dokumente sind in den Top-K?
- **NDCG** (Normalized Discounted Cumulative Gain): Qualität des Rankings
- Menschliche Evaluation der generierten Antworten

---

## Zusammenfassung

Die Evolution von RAG-Systemen zeigt einen klaren Trend:

1. **Einfache Vektorsuche** → Grundlage, aber unzureichend
2. **Hybrid Search** → Kombination aus Keyword + Semantik
3. **Contextual Retrieval** → Kontext für jeden Chunk
4. **Reranking** → Feinabstimmung der Ergebnisse

Die Kombination aller Techniken kann die Fehlertrefferquote um **bis zu 67%** reduzieren. Für Produktions-RAG-Systeme sind diese Methoden heute unverzichtbar.

---

## Praxis-Implementierung: Contextual Retrieval mit Claude

Hier ist ein vollständiger Python-Code zur Implementierung von Contextual Retrieval mit der Anthropic API:

```python
import anthropic

client = anthropic.Anthropic()

def add_context_to_chunk(document: str, chunk: str) -> str:
    response = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=200,
        messages=[
            {
                "role": "user",
                "content": f"""<document>
{document}
</document>

<chunk>
{chunk}
</chunk>

Give a short 1-2 sentence context for this chunk within the document. Answer only with the context, no preamble."""
            }
        ]
    )
    return response.content[0].text


def prepare_chunks_with_context(document: str, chunks: list[str]) -> list[dict]:
    result = []
    for chunk in chunks:
        context = add_context_to_chunk(document, chunk)
        result.append({
            "original": chunk,
            "contextualized": f"{context}\n\n{chunk}"
        })
    return result


# Example
document = """
Q3 2024 Financial Report - Acme Corp

Revenue increased by 15% to $4.2M. The growth was driven by the new enterprise segment.
Customer churn dropped to 2.1%, down from 3.4% in Q2.
Operating costs rose by 8% due to new hires in engineering.
Net profit margin stands at 18%.
"""

chunks = [
    "Customer churn dropped to 2.1%, down from 3.4% in Q2.",
    "Operating costs rose by 8% due to new hires in engineering."
]

enriched = prepare_chunks_with_context(document, chunks)

for i, item in enumerate(enriched):
    print(f"--- Chunk {i+1} ---")
    print("Original: ", item["original"])
    print("Contextualized:", item["contextualized"])
    print()
```

### Wichtige Hinweise zur Implementierung

1. **Prompt Caching nutzen**: Lade das Dokument einmal in den Cache und referenziere es für alle Chunks. Das reduziert die Kosten erheblich.

2. **Chunk-Größe**: 50-100 Tokens Kontext sind ideal – genug für Orientierung, nicht zu viel für die Embedding-Qualität.

3. **Modellwahl**: Claude 3 Haiku ist schnell und kostengünstig für diese Aufgabe. Für komplexe Dokumente kann Claude 3.5 Sonnet bessere Ergebnisse liefern.

---

## Quellen

- [Elastic: Hybrid Search Guide](https://www.elastic.co/what-is/hybrid-search)
- [Superlinked: Optimizing RAG with Hybrid Search & Reranking](https://superlinked.com/vectorhub/articles/optimizing-rag-with-hybrid-search-reranking)
- [Anthropic: Contextual Retrieval](https://www.anthropic.com/engineering/contextual-retrieval)

---

*Artikel erstellt am 13.03.2026*
