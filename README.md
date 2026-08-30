# 🤗 Hugging Face Workflow Automation & AI Platform

An enterprise-grade visual workflow automation platform powered by Next.js 14, React Flow (`@xyflow/react`), and Hugging Face Serverless Router APIs. Connect Telegram bots, WhatsApp webhooks, free Hugging Face AI models, autonomous OpenClaw agents, and cloud object storage buckets into low-latency DAG execution graphs with zero database hosting fees.

---

## ✨ Features

- **🐾 OpenClaw Autonomous AI Agent**: Zero-cost agent runtime hosted on Free Hugging Face Spaces (2 vCPU + 16 GB RAM) with live Web Search, Python REPL, and persistent Hub memory.
- **🤖 Autonomous Telegram & WhatsApp Bots**: Continuous background webhook receivers with `@BotFather` integration and Meta Cloud API dispatches.
- **🤗 100% Free Hugging Face AI Model Suite**:
  - **Text & Reasoning**: `meta-llama/Llama-3.3-70B-Instruct`, `deepseek-ai/DeepSeek-R1-Distill-Qwen-32B`.
  - **Image Generation**: `black-forest-labs/FLUX.1-schnell` (1024x1024 photorealistic art).
  - **Video Synthesis**: `cerspense/zeroscope_v2_576w` (Text-to-Video generation).
  - **Music Composition**: `facebook/musicgen-small` (32kHz stereo audio).
  - **Speech-to-Text**: `openai/whisper-large-v3` (multilingual audio transcription).
- **📂 Personal Hugging Face Account Hub**: Fetch personal HF **Spaces**, **Fine-Tuned Models**, and **Storage Datasets** (`datasets/{username}/hf-workflow-data`).
- **🪣 Multi-Cloud Storage Bucket Support**: Native integrations for Hugging Face Hub Datasets, Spaces `/data` Volumes, Cloudflare R2, AWS S3, and MinIO.
- **🟢 Live Auto-Run Mode**: 1-click continuous workflow execution toggle on the studio header bar.
- **🛠️ Visual DAG Execution Drawer**: Step-by-step trace timeline, memory execution waterfall, and Hugging Face diagnostic solution matrix.

---

## 🪣 Storage Buckets & Persistence Guide (How to Install & Use Each)

HF Workflow supports multiple storage bucket engines depending on whether you need Git-backed versioning, persistent Space memory, or high-throughput media object storage.

---

### 1. 🤗 Hugging Face Hub Dataset Bucket (Default & 100% Free)
- **Bucket Identifier**: `datasets/{username}/hf-workflow-data`
- **Type**: Git LFS / Parquet / JSONL version-controlled cloud storage.
- **Cost**: **100% Free & Unlimited** on Hugging Face Hub.
- **Best For**: Storing visual workflow graphs, execution run logs, node states, and agent memories.

#### How to Install & Configure:
No external servers required. Stored directly on Hugging Face Hub using the REST API / `huggingface_hub` SDK.

```bash
# 1. (Optional) Install Python Hugging Face Hub client
pip install huggingface_hub

# 2. (Optional) Login via CLI
huggingface-cli login --token hf_your_write_token
```

#### Environment Variables (`.env.local`):
```env
HF_TOKEN=hf_your_write_token_here
HF_DATASET_NAME=hf-workflow-data
```

#### How to Use in Workflow:
1. Go to **Settings ➔ Storage & Sync**.
2. Enter your dataset repository name (e.g. `hf-workflow-data`).
3. Toggle **Auto-Sync on Every Run** to `ON`. Every execution will automatically commit an immutable Git snapshot to `https://huggingface.co/datasets/<your-username>/hf-workflow-data`.

---

### 2. 🪐 Hugging Face Space Persistent Storage Volume (`/data`)
- **Bucket Identifier**: `/data` mounted volume on Hugging Face Spaces.
- **Type**: NVMe / SSD persistent filesystem volume attached to a Space runtime.
- **Cost**: **Free** ephemeral space disk or **$5/mo** persistent 20GB tier.
- **Best For**: OpenClaw persistent conversation memory, SQLite/DuckDB vector caches, local media buffers.

#### How to Install & Configure:
Add the `storage` configuration tag in your Hugging Face Space's `README.md` metadata header:

```yaml
---
title: OpenClaw Assistant
emoji: 🐾
colorFrom: orange
colorTo: purple
sdk: gradio
sdk_version: 4.44.0
app_file: app.py
pinned: false
storage: small # Options: small (20GB - $5/mo), medium (100GB), large (500GB)
---
```

#### How to Use in Code / Python REPL:
```python
import os
import json

# The /data directory is preserved across Space restarts
DATA_DIR = "/data" if os.path.exists("/data") else "./local_data"
os.makedirs(DATA_DIR, exist_ok=True)

# Save agent state
with open(f"{DATA_DIR}/workflow_memory.json", "w") as f:
    json.dump({"last_task": "Research quantum AI", "timestamp": "2026-08-30"}, f)
```

---

### 3. ⚡ Cloudflare R2 Object Storage Bucket (S3-Compatible • $0 Egress)
- **Bucket Identifier**: `https://<account_id>.r2.cloudflarestorage.com/<bucket_name>`
- **Type**: S3-compatible cloud object storage with zero egress bandwidth charges.
- **Cost**: **Free Tier**: 10 GB storage, 10 Million read requests, 1 Million write requests/mo.
- **Best For**: High-resolution image outputs (FLUX.1), video clips (ZeroScope MP4), and audio files (MusicGen WAV).

#### How to Install:
```bash
# Install AWS SDK S3 client in your project
npm install @aws-sdk/client-s3
```

#### Environment Variables (`.env.local`):
```env
CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id
R2_ACCESS_KEY_ID=your_r2_access_key_id
R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
R2_BUCKET_NAME=hf-workflow-media
R2_PUBLIC_URL=https://pub-your_r2_subdomain.r2.dev
```

#### How to Use in Node.js / Workflow Logic Node:
```typescript
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

// Upload generated media to R2
async function uploadMedia(fileName: string, buffer: Buffer, contentType: string) {
  await r2Client.send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: fileName,
    Body: buffer,
    ContentType: contentType,
  }));
  return `${process.env.R2_PUBLIC_URL}/${fileName}`;
}
```

---

### 4. 📦 Amazon AWS S3 Bucket
- **Bucket Identifier**: `s3://<bucket-name>/<key>`
- **Type**: Enterprise-grade cloud object storage.
- **Cost**: AWS Free Tier (5 GB standard storage for 12 months).
- **Best For**: Enterprise multimodal archive, backup datasets, and multi-region deployment.

#### How to Install & Configure:
```bash
# 1. Install AWS CLI
brew install awscli   # On macOS
# or: apt-get install awscli

# 2. Configure AWS credentials
aws configure

# 3. Create your S3 bucket
aws s3 mb s3://my-hf-workflow-bucket --region us-east-1
```

#### Environment Variables (`.env.local`):
```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_S3_BUCKET=my-hf-workflow-bucket
```

---

### 5. 🐳 MinIO Self-Hosted S3 Bucket (100% Free & Open Source)
- **Bucket Identifier**: `http://localhost:9000/<bucket-name>`
- **Type**: Self-hosted, lightweight S3-compatible object storage server.
- **Cost**: **100% Free & Open-Source**.
- **Best For**: Local offline testing, on-premise deployments, and zero-cost self-hosting.

#### How to Install & Run via Docker:
```bash
# 1. Run MinIO container with Docker
docker run -d \
  -p 9000:9000 \
  -p 9001:9001 \
  --name minio-hf \
  -v ~/minio-data:/data \
  -e "MINIO_ROOT_USER=minioadmin" \
  -e "MINIO_ROOT_PASSWORD=minioadminpassword" \
  minio/minio server /data --console-address ":9001"

# 2. Access MinIO Web Console at http://localhost:9001
# 3. Create a new bucket named 'hf-workflows'
```

#### Environment Variables (`.env.local`):
```env
MINIO_ENDPOINT=http://127.0.0.1:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadminpassword
MINIO_BUCKET_NAME=hf-workflows
```

---

## 🏗️ Architecture & Project Structure

```
HFworkflow/
├── apps/
│   └── web/                                # Next.js 14 Full-Stack Web Application
│       ├── app/
│       │   ├── (auth)/login/               # Hugging Face OAuth & Secret Token Login
│       │   ├── (dashboard)/spaces/         # Account Spaces, Models & OpenClaw Agent Hub
│       │   ├── (dashboard)/workflows/      # Workflows Studio & Pre-built Templates
│       │   ├── (dashboard)/settings/       # 9-Domain Multi-Tab Settings & Explanatory Hub
│       │   ├── api/
│       │   │   ├── execute/route.ts        # Primary DAG Workflow Executor API
│       │   │   ├── spaces/route.ts         # Hugging Face Account Assets API
│       │   │   └── webhooks/telegram/      # Telegram Webhook Receiver Route
│       │   └── canvas/[workflowId]/        # Visual Flow Canvas Studio Page
│       ├── components/
│       │   └── canvas/                     # React Flow Canvas, TopNav, NodeInspector, Drawer
│       └── lib/
│           ├── engine/
│           │   ├── dagParser.ts            # Kahn's Topological Sorting Algorithm
│           │   ├── executor.ts             # Async Multi-Tier Execution Pipeline
│           │   ├── nodes/openclawAgent.ts  # OpenClaw Autonomous ReAct Loop Engine
│           │   └── variableResolver.ts     # Template Variable Resolution Engine
│           ├── nodeRegistry.ts             # Palette Node Specifications & Param Schemas
│           ├── templates.ts                # 12 Pre-Built Workflow DAG Templates with HF Guides
│           └── hfStorage.ts                # Git Dataset Persistence API
└── packages/
    └── shared-types/                       # TypeScript Type Definitions Package
```

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js `v18.0.0` or higher
- npm or pnpm

### 2. Installation & Setup
```bash
# Clone repository
git clone https://github.com/mahmoud-mohasseb/startresume-saas.git
cd HFworkflow

# Install dependencies
npm install

# Start Next.js Development Server
npm run dev
```

The application will be available at **`http://localhost:3000`**.

---

## 🔑 Hugging Face Authentication

1. Generate a **Write Access Token** on [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens) with `Inference` and `Write` permissions.
2. Open **`http://localhost:3000/login`** and paste your token (`hf_...`).
3. Your workflows will automatically commit to `datasets/{username}/hf-workflow-data` with zero database fees.

---

## 🧪 Testing Workflows

### Run Comprehensive Automated Test Suite (99 Tests)
```bash
npx tsx scripts/test-suite.ts
```

### Run TypeScript Type Check
```bash
npx tsc --noEmit
```

---

## 📄 License
MIT License. Built with Next.js, React Flow, and Hugging Face.
