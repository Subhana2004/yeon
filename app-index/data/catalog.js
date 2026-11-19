import { fixtures } from "./fixtures.js";

export const fields = ["Vision", "Language", "Systems", "Multimodal"];
export const labs = fixtures.map((record) => ({
  ...record,
  kind: "fictional",
  source: "YEON V4 demonstration collection",
  verified: null,
}));
export const labBy = (id) => labs.find((lab) => lab.id === id);
export const papers = {
  dpr: {
    title: "Dense Passage Retrieval for Open-Domain Question Answering",
    author: "Karpukhin et al.",
    year: 2020,
    url: "https://aclanthology.org/2020.emnlp-main.550/",
    method: "Dense retrieval",
    problem: "retrieval",
    note: "The authors encode questions and passages separately, then retrieve by vector similarity.",
  },
  colbert: {
    title:
      "ColBERT: Efficient and Effective Passage Search via Contextualized Late Interaction over BERT",
    author: "Khattab & Zaharia",
    year: 2020,
    url: "https://arxiv.org/abs/2004.12832",
    method: "Late interaction",
    problem: "retrieval",
    note: "The authors retain token-level representations and defer fine-grained interaction until scoring.",
  },
  simclr: {
    title:
      "A Simple Framework for Contrastive Learning of Visual Representations",
    author: "Chen et al.",
    year: 2020,
    url: "https://arxiv.org/abs/2002.05709",
    method: "Image-pair contrast",
    problem: "alignment",
    note: "The method learns from differently augmented views of the same image.",
  },
  clip: {
    title:
      "Learning Transferable Visual Models From Natural Language Supervision",
    author: "Radford et al.",
    year: 2021,
    url: "https://arxiv.org/abs/2103.00020",
    method: "Image–text contrast",
    problem: "alignment",
    note: "The model learns to associate images and captions using paired observations.",
  },
};
for (const [id, paper] of Object.entries(papers))
  Object.assign(paper, { id, kind: "public", checked: "2026-11-19" });
export const problems = {
  retrieval: {
    name: "Retrieve a relevant passage",
    question: "Where should a retriever spend its work?",
    labs: ["mosaic", "vertex"],
    methods: ["dpr", "colbert", "lexical"],
  },
  alignment: {
    name: "Learn visual representations",
    question: "Which observations should a model bring together?",
    labs: ["arbor", "prism"],
    methods: ["simclr", "clip"],
  },
};
export const approaches = {
  dpr: {
    name: "Dense retrieval",
    mechanism: "Encode queries and passages into fixed-length vectors.",
    assumption: "Training pairs reflect the questions readers will ask.",
    evaluation:
      "Measure recall at a fixed retrieval depth, latency and index size on held-out queries.",
    strength: "Compact passage vectors support fast candidate search.",
    failure: "One vector can lose a small but decisive detail.",
    when: "Try when paraphrases matter and labeled passages are available.",
    paperId: "dpr",
  },
  colbert: {
    name: "Late interaction",
    mechanism:
      "Compare contextualized query tokens with passage tokens at scoring time.",
    assumption: "Token-level matches preserve useful evidence.",
    evaluation:
      "Compare relevance, storage and response time at the same candidate depth.",
    strength:
      "Fine-grained matches can retain details lost in a single vector.",
    failure: "Token indexes can strain a tight storage budget.",
    when: "Try when local evidence matters and the index can carry token vectors.",
    paperId: "colbert",
  },
  lexical: {
    name: "Lexical retrieval",
    mechanism: "Rank passages using matches between query and passage terms.",
    assumption: "Relevant passages share distinctive terms with the query.",
    evaluation:
      "Inspect rare identifiers, synonyms, recall and latency against a shared judgment set.",
    strength: "Exact terms are easy to trace and inspect.",
    failure: "A paraphrase with no shared terms can disappear from results.",
    when: "Try for identifiers, named entities or a simple baseline.",
    paperId: "dpr",
  },
  simclr: {
    name: "Image-pair contrast",
    mechanism: "Bring two augmented views of one image closer.",
    assumption: "The chosen augmentations preserve the property of interest.",
    evaluation:
      "Test linear probes and transfer on held-out images. Audit augmentation-sensitive classes.",
    strength: "Training can use images without captions.",
    failure: "Cropping can remove the feature that determines the label.",
    when: "Try with unlabeled images and a defensible augmentation policy.",
    paperId: "simclr",
  },
  clip: {
    name: "Image–text contrast",
    mechanism: "Align images and their paired captions in a shared space.",
    assumption: "Captions describe meaningful visible content.",
    evaluation:
      "Test image–text retrieval and prompt-sensitive classification across domains.",
    strength: "Natural-language descriptions can express new categories.",
    failure:
      "Noisy captions and domain-specific language can distort alignment.",
    when: "Try when language-based queries are part of the intended use.",
    paperId: "clip",
  },
};
const readingIds = {
  arbor: ["simclr", "clip"],
  mosaic: ["dpr", "colbert"],
  horizon: ["simclr"],
  dialogue: ["dpr"],
  orchid: ["simclr"],
  vertex: ["dpr", "colbert"],
  prism: ["clip", "simclr"],
  delta: [],
};
export const readings = (lab) =>
  (readingIds[lab.id] || []).map((key) => papers[key]);
export const exampleDoor = {
  id: "reading-placement",
  title: "Research reading placement",
  area: "Language",
  institution: "Sample Institute B",
  position: "Reading placement",
  eligibility: "Undergraduate",
  status: "Unknown",
  verified: null,
  deadline: null,
  url: null,
  kind: "fictional",
  lab: "mosaic",
};
