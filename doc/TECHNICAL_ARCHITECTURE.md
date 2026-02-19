# Technical Architecture & Workflows

**For:** Technical Review / Development Roadmap
**Overview:** Detailed breakdown of the "Edge-First" infrastructure and AI data flows.

---

## 1. User Journey: The AI Diagnosis Pipeline
*How data moves from the customer's camera to your dashboard securely and instantly.*

```mermaid
graph TD
    subgraph "Client Side (Browser / V8 Engine)"
        User["User's Device (Diagnosis)"]
        Booking[Booking Form]
    end
    
    subgraph "The Edge (Latency <50ms)"
        Proxy[AI Proxy Worker]
    end
    
    subgraph "External Intelligence"
        AI["Gemini 2.5 Flash"]
    end
    
    subgraph "Backend Services (Server-Side)"
        NextServer["Next.js Server Action"]
        DB["Payload CMS / Database"]
        Square["Square API"]
    end

    subgraph "Admin & Operations"
        Dash[Admin Dashboard]
    end

    User <-->|"1. WebSocket Stream (Audio/Video)"| Proxy
    Proxy <-->|"2. Real-time Analysis"| AI
    
    AI -->|"3. Tool Call: report_diagnosis()"| Proxy
    Proxy -->|"4. Handoff Data (SessionStorage)"| User
    
    User -->|"5. Auto-Navigate"| Booking
    Booking -->|"6. Submit Form (Server Action)"| NextServer
    NextServer -->|"7. Process Payment"| Square
    NextServer -->|"8. Create Service Request"| DB
    Dash <-->|"9. Real-time Sync"| DB
```

---

## 2. The Growth Engine: Autonomous SEO Loop
*How the system writes unique content using Vector Memory to avoid duplication.*

```mermaid
sequenceDiagram
    participant Cron as Scheduler
    participant Memory as "Vector DB (Context Headers Only)"
    participant Writer as AI Agent
    participant Web as Website

    Cron->>Memory: "Scan headers for recent topics"
    Memory-->>Cron: Returns lightweight topic map
    Cron->>Writer: "Write unique article on [Topic]"
    Writer->>Writer: Generate Full Article (Body)
    Writer->>Writer: COMPRESS -> Generate "Semantic Header"
    Note right of Writer: Creates dense 50-token summary<br/>for fast traversal
    Writer->>Web: Publish Full Article
    Writer->>Memory: Embed & Store ONLY Semantic Header
```

**Key Innovation: The "Semantic Header" Strategy**
Instead of storing the entire article (which is slow to search), we generate a **Compressed Context Header**—a dense, 50-token summary of the article's core meaning (similar to a network packet header).
*   **Speed:** The Vector DB traverses these tiny headers instantly.
*   **Novelty:** The AI checks against these headers to ensure it never writes the same article twice.

---

---

## 3. Smart Caching Strategy (The "Time Travel" Layer)
*How we make the site feel instant for 99% of visitors.*

**The Real Bottleneck: distance + "The Messy Internet"**
A theoretical fiber line from Houston to Ashburn is ~40ms. But on real 4G/5G/Wi-Fi with ISP routing? It's often **150ms - 300ms** just to start receiving data.

**Our Solution: Aggressive Edge Caching**
We cache content *physically* in Houston (and Dallas/Austin).
*   **The Difference:** Instead of fighting through 1,400 miles of public internet traffic, the request hits the Cloudflare tower down the street.
*   **Result:** **20ms - 40ms** real-world load times (vs 200ms+). The speed difference is visceral.

---

## 4. Infrastructure: The Cloudflare Edge
*Why this system is faster than traditional hosting.*

```mermaid
graph LR
    Customer([Customer])
    
    subgraph "Traditional Hosting (Origin)"
        Server["Single Server (Virginia)"]
    end
    
    subgraph "Our Edge Architecture (CDN)"
        City1["Edge Node (Houston)"]
        City2["Edge Node (Dallas)"]
        City3["Edge Node (Austin)"]
    end

    Customer -.->|"Backbone Round Trip (~200ms+)"| Server
    Customer ==>|"Local Cache Hit (~20-40ms)"| City1
    
    City1 -.->|"Background Sync"| Server
    
    note[The content is already waiting in Houston.<br/>No need to travel to Virginia.]
```
