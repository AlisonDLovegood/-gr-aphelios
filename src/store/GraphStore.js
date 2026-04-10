import { create } from 'zustand'

const useGraphStore = create((set, get) => ({

  // ─── ESTRUTURA DO GRAFO ───────────────────────────────────────────
  nodes: [],
  edges: [],
  directed: false,
  weighted: false,

  // ─── CONTADORES — nunca decrementam, garantem ids únicos ──────────
  nodeCounter: 0,
  edgeCounter: 0,

  // ─── FERRAMENTA ATIVA ─────────────────────────────────────────────
  activeTool: 'select',

  // ─── ALGORITMOS ───────────────────────────────────────────────────
  selectedAlgorithm: null,
  isRunning: false,
  currentStep: 0,
  steps: [],
  pseudocode: '',

  // ─── AÇÕES DO GRAFO ───────────────────────────────────────────────

  // adiciona um nó com id único, posição e label vazio
  addNode: (x, y) => set((state) => ({
    nodes: [...state.nodes, { id: state.nodeCounter, x, y, label: '' }],
    nodeCounter: state.nodeCounter + 1
  })),

  // adiciona uma aresta com id único, peso padrão, sem direção
  addEdge: (sourceId, targetId) => set((state) => ({
    edges: [...state.edges, { id: state.edgeCounter, source: sourceId, target: targetId, weight: null, directed: false, orientation: null }],
    edgeCounter: state.edgeCounter + 1
  })),

  // remove um nó pelo id e todas as arestas conectadas a ele
  removeNode: (id) => set((state) => ({
    nodes: state.nodes.filter((n) => n.id !== id),
    edges: state.edges.filter((e) => e.source !== id && e.target !== id)
  })),

  // remove uma aresta pelo id
  removeEdge: (id) => set((state) => ({
    edges: state.edges.filter((e) => e.id !== id)
  })),

  // atualiza o label de um nó pelo id
  updateNodeLabel: (id, label) => set((state) => ({
    nodes: state.nodes.map((n) => n.id === id ? { ...n, label } : n)
  })),

  // atualiza peso, direção e orientação de uma aresta pelo id
  updateEdge: (id, weight, directed, orientation) => set((state) => ({
    edges: state.edges.map((e) => e.id === id ? { ...e, weight, directed, orientation } : e)
  })),

  // limpa todos os nós e arestas do canvas e reseta os contadores
  clearCanvas: () => set({ nodes: [], edges: [], nodeCounter: 0, edgeCounter: 0 }),

  // ─── AÇÕES DA TOOLBAR ─────────────────────────────────────────────

  // troca a ferramenta ativa
  setActiveTool: (tool) => set({ activeTool: tool }),

  // ─── AÇÕES DO TIPO DO GRAFO ───────────────────────────────────────

  // alterna entre dirigido e não dirigido
  toggleDirected: () => set((state) => ({ directed: !state.directed })),

  // alterna entre ponderado e não ponderado
  toggleWeighted: () => set((state) => ({ weighted: !state.weighted })),

  // ─── AÇÕES DOS ALGORITMOS ─────────────────────────────────────────

  // define o algoritmo selecionado
  setAlgorithm: (algorithm) => set({ selectedAlgorithm: algorithm, currentStep: 0, pseudocode: '' }),

  // inicia a execução do algoritmo
  startExecution: () => set({ isRunning: true }),

  // para a execução do algoritmo e reseta o estado
  stopExecution: () => set({ isRunning: false, currentStep: 0, pseudocode: '', steps: [] }),

  // avança um passo na execução
  nextStep: () => set((state) => ({ currentStep: state.currentStep + 1 })),

  // retrocede um passo na execução
  prevStep: () => set((state) => ({ currentStep: Math.max(0, state.currentStep - 1) })),

  // vai para o primeiro passo
  firstStep: () => set({ currentStep: 0 }),

  // vai para o último passo
  lastStep: () => set((state) => ({ currentStep: state.steps.length - 1 })),

}))

export default useGraphStore