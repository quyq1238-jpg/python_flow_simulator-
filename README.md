<!DOCTYPE html>
<html lang="vi" class="h-full bg-slate-900 text-slate-100">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mô Phỏng Lưu Đồ Thuật Toán Python - Python Flow Simulator</title>
  
  <!-- Tailwind CSS -->
  <script src="https://cdn.tailwindcss.com"></script>
  
  <!-- Font Awesome Icons -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  
  <!-- Inter & JetBrains Mono Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:ital,wght@0,400;0,500;0,700;1,400&display=swap" rel="stylesheet">

  <!-- Custom CSS Animations & SVG Styles -->
  <style>
    body {
      font-family: 'Inter', sans-serif;
    }
    .font-mono {
      font-family: 'JetBrains Mono', monospace;
    }

    /* Flowchart Shape & Path Styling */
    .fc-node {
      transition: all 0.25s ease;
      cursor: pointer;
    }
    .fc-node:hover rect, .fc-node:hover polygon, .fc-node:hover path {
      filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.6));
    }
    .fc-node.active rect, .fc-node.active polygon, .fc-node.active path {
      stroke: #38bdf8 !important;
      stroke-width: 3.5px !important;
      filter: drop-shadow(0 0 12px rgba(56, 189, 248, 0.9));
      animation: pulse-border 1.5s infinite alternate;
    }
    .fc-node.active text {
      font-weight: bold;
      fill: #ffffff !important;
    }

    @keyframes pulse-border {
      0% { filter: drop-shadow(0 0 4px rgba(56, 189, 248, 0.6)); }
      100% { filter: drop-shadow(0 0 14px rgba(56, 189, 248, 1)); }
    }

    /* Directional Flow Arrow Animation */
    .fc-edge {
      stroke: #64748b;
      stroke-width: 2px;
      fill: none;
      transition: all 0.3s ease;
    }
    .fc-edge.active {
      stroke: #38bdf8;
      stroke-width: 3px;
      stroke-dasharray: 6 4;
      animation: flowDash 0.8s linear infinite;
      filter: drop-shadow(0 0 6px rgba(56, 189, 248, 0.8));
    }

    @keyframes flowDash {
      to {
        stroke-dashoffset: -20;
      }
    }

    /* Custom Scrollbar */
    ::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    ::-webkit-scrollbar-track {
      background: #0f172a;
    }
    ::-webkit-scrollbar-thumb {
      background: #334155;
      border-radius: 4px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: #475569;
    }

    .line-active {
      background-color: rgba(56, 189, 248, 0.25) !important;
      border-left: 4px solid #38bdf8;
    }

    /* Modal Backdrop */
    .modal-backdrop {
      background-color: rgba(15, 23, 42, 0.8);
      backdrop-filter: blur(4px);
    }
  </style>
</head>
<body class="h-full flex flex-col overflow-hidden bg-slate-950 text-slate-100">

  <!-- Navigation / Top Header -->
  <header class="bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-md">
    <div class="flex items-center space-x-3">
      <div class="bg-gradient-to-tr from-blue-600 to-cyan-500 p-2 rounded-lg shadow-lg">
        <i class="fa-solid fa-diagram-project text-xl text-white"></i>
      </div>
      <div>
        <h1 class="text-lg font-bold text-white tracking-wide flex items-center gap-2">
          PYTHON FLOW SIMULATOR
          <span class="text-xs bg-blue-500/20 text-blue-400 font-mono px-2 py-0.5 rounded border border-blue-500/30">Chuẩn SGK Tin Học</span>
        </h1>
        <p class="text-xs text-slate-400">Mô phỏng trực quan thuật toán & Lưu đồ theo chuẩn kiến thức phổ thông</p>
      </div>
    </div>

    <!-- Toolbar Options & Example Selector -->
    <div class="flex items-center flex-wrap gap-2">
      <div class="flex items-center bg-slate-800/80 rounded-lg p-1 border border-slate-700">
        <label for="presetSelect" class="text-xs font-medium text-slate-300 px-2 flex items-center gap-1">
          <i class="fa-solid fa-code text-blue-400"></i> Bài mẫu:
        </label>
        <select id="presetSelect" class="bg-slate-900 text-xs text-slate-200 rounded px-2 py-1 border border-slate-700 focus:outline-none focus:border-blue-500">
          <option value="preset_swap">Ví dụ 1: Tuần tự (Hoán đổi 2 số a, b)</option>
          <option value="preset_if" selected>Ví dụ 2: Rẽ nhánh (Kiểm tra số n: Âm, Dương, 0)</option>
          <option value="preset_for">Ví dụ 3: Lặp For (Tính tổng S = 1 + 2 + ... + N)</option>
          <option value="preset_while">Ví dụ 4: Lặp While (Đếm ngược N về 1)</option>
        </select>
      </div>

      <button id="btnBuildFlow" class="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow">
        <i class="fa-solid fa-arrows-rotate"></i> Tạo lưu đồ
      </button>
    </div>
  </header>

  <!-- Main Application Body -->
  <div class="flex-1 flex flex-col md:flex-row overflow-hidden relative">

    <!-- LEFT PANEL: Code Editor, Execution Controls & Outputs -->
    <div class="w-full md:w-5/12 lg:w-4/12 flex flex-col bg-slate-900/90 border-r border-slate-800 h-full overflow-hidden shrink-0">
      
      <!-- Panel Tabs -->
      <div class="flex border-b border-slate-800 bg-slate-950/60 text-xs font-medium text-slate-400">
        <button id="tabBtnEditor" class="flex-1 py-2.5 px-3 text-center border-b-2 border-blue-500 text-blue-400 font-semibold flex items-center justify-center gap-2">
          <i class="fa-solid fa-code"></i> Mã nguồn Python
        </button>
        <button id="tabBtnOnlinePython" class="flex-1 py-2.5 px-3 text-center border-b-2 border-transparent hover:text-slate-200 flex items-center justify-center gap-2">
          <i class="fa-brands fa-python"></i> Online Python IDE
        </button>
      </div>

      <!-- Tab Content 1: Code Editor & Simulator -->
      <div id="tabContentEditor" class="flex-1 flex flex-col overflow-hidden">
        
        <!-- Code Editor Area -->
        <div class="relative flex-1 flex bg-slate-950 font-mono text-xs overflow-hidden border-b border-slate-800">
          <div id="lineNumbers" class="w-10 py-3 bg-slate-900/60 text-slate-500 text-right pr-2 select-none border-r border-slate-800/60 leading-6">
            1
          </div>
          <div class="relative flex-1 overflow-auto">
            <!-- Dynamic Line Highlight Backgrounds -->
            <div id="codeHighlights" class="absolute inset-0 pointer-events-none pt-3 leading-6"></div>
            <!-- Textarea for Python code input -->
            <textarea id="pythonCodeInput" class="w-full h-full bg-transparent text-slate-100 p-3 outline-none resize-none leading-6 whitespace-pre font-mono relative z-10" spellcheck="false"></textarea>
          </div>
        </div>

        <!-- Execution Control Toolbar -->
        <div class="p-3 bg-slate-900 border-b border-slate-800 flex flex-col gap-2">
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-1.5">
              <button id="btnStartSim" class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold flex items-center gap-1 shadow">
                <i class="fa-solid fa-play"></i> Mô phỏng
              </button>
              <button id="btnStepPrev" disabled class="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded text-xs font-semibold flex items-center gap-1 border border-slate-700">
                <i class="fa-solid fa-rotate-left"></i> Lùi
              </button>
              <button id="btnStepNext" disabled class="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded text-xs font-semibold flex items-center gap-1 shadow">
                Tiếp <i class="fa-solid fa-chevron-right"></i>
              </button>
              <button id="btnResetSim" class="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded text-xs border border-slate-700">
                <i class="fa-solid fa-arrow-rotate-left"></i>
              </button>
            </div>

            <!-- Auto Play Speed Controls -->
            <div class="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded border border-slate-800">
              <i class="fa-solid fa-gauge-high text-xs text-slate-400"></i>
              <input id="speedRange" type="range" min="200" max="1800" step="100" value="800" class="w-16 h-1 accent-blue-500 cursor-pointer">
            </div>
          </div>

          <!-- Step Progress Status -->
          <div class="flex items-center justify-between text-xs text-slate-400 px-1 pt-1">
            <span id="stepCounterText">Trạng thái: Sẵn sàng</span>
            <span id="stepPercentage" class="font-mono text-blue-400 font-semibold">Bước 0/0</span>
          </div>
        </div>

        <!-- Step Explanation & Variable State Panel -->
        <div class="h-44 bg-slate-950 flex flex-col border-b border-slate-800 overflow-hidden">
          <div class="bg-slate-900/80 px-3 py-1.5 text-xs font-semibold text-slate-300 flex items-center justify-between border-b border-slate-800">
            <span class="flex items-center gap-1.5 text-cyan-400">
              <i class="fa-solid fa-comment-dots"></i> Giải thích từng bước
            </span>
            <span class="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">Trace Log</span>
          </div>
          <div id="stepExplanation" class="p-3 text-xs text-slate-300 overflow-y-auto leading-relaxed flex-1 space-y-1">
            <p class="text-slate-500 italic">Nhấn [▶ Mô phỏng] hoặc [Tạo lưu đồ] để bắt đầu theo dõi từng câu lệnh.</p>
          </div>
        </div>

        <!-- Variables Watch & Output Terminal -->
        <div class="flex-1 flex flex-col min-h-[140px] bg-slate-950 overflow-hidden">
          <div class="grid grid-cols-2 h-full">
            <!-- Variable Watcher -->
            <div class="border-r border-slate-800 flex flex-col overflow-hidden">
              <div class="bg-slate-900/80 px-2.5 py-1 text-[11px] font-semibold text-slate-400 border-b border-slate-800 flex items-center gap-1">
                <i class="fa-solid fa-square-poll-vertical text-amber-400"></i> Giá trị biến
              </div>
              <div class="flex-1 overflow-y-auto p-2">
                <table class="w-full text-left text-xs font-mono">
                  <thead>
                    <tr class="text-slate-500 border-b border-slate-800/60 text-[10px]">
                      <th class="pb-1">Biến</th>
                      <th class="pb-1">Giá trị</th>
                    </tr>
                  </thead>
                  <tbody id="variablesTableBody">
                    <tr><td colspan="2" class="text-slate-600 text-[11px] py-2 italic">Chưa có biến</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Terminal Output -->
            <div class="flex flex-col overflow-hidden bg-black/60 font-mono">
              <div class="bg-slate-900/80 px-2.5 py-1 text-[11px] font-semibold text-slate-400 border-b border-slate-800 flex items-center justify-between">
                <span class="flex items-center gap-1">
                  <i class="fa-solid fa-terminal text-emerald-400"></i> Terminal Output
                </span>
                <button id="btnClearTerminal" class="text-[10px] text-slate-500 hover:text-slate-300">
                  Xóa
                </button>
              </div>
              <div id="terminalOutput" class="flex-1 p-2 text-xs text-emerald-400 overflow-y-auto whitespace-pre-wrap leading-5">
                > System ready.
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- Tab Content 2: Embedded Online Python IDE -->
      <div id="tabContentOnlinePython" class="flex-1 hidden flex-col bg-slate-950">
        <div class="p-2 bg-slate-900 text-xs text-slate-400 flex items-center justify-between border-b border-slate-800">
          <span><i class="fa-solid fa-info-circle text-blue-400"></i> Trình biên dịch Online Python chính thức</span>
          <a href="https://www.online-python.com/" target="_blank" class="text-blue-400 hover:underline flex items-center gap-1">
            Mở tab mới <i class="fa-solid fa-external-link text-[10px]"></i>
          </a>
        </div>
        <iframe src="https://www.online-python.com/" class="w-full flex-1 border-none" title="Online Python Compiler"></iframe>
      </div>

    </div>

    <!-- RIGHT PANEL: Textbook SVG Flowchart Renderer -->
    <div class="w-full md:w-7/12 lg:w-8/12 flex flex-col bg-slate-950 h-full relative overflow-hidden">
      
      <!-- Flowchart Toolbar -->
      <div class="bg-slate-900/90 border-b border-slate-800 px-4 py-2 flex items-center justify-between z-10">
        <div class="flex items-center space-x-2">
          <span class="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
            <i class="fa-solid fa-sitemap text-blue-400"></i> Lưu Đồ Thuật Toán (Flowchart)
          </span>
          <span class="text-[10px] text-slate-500 hidden sm:inline-block">
            | Đỉnh: Start/End, Hình Thoi: Điều kiện, Hình Chữ Nhật: Xử lý, Hình Bình Hành: Vào/Ra
          </span>
        </div>

        <!-- Zoom & Export Controls -->
        <div class="flex items-center space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button id="btnZoomOut" class="p-1.5 text-slate-400 hover:text-white text-xs rounded hover:bg-slate-800" title="Thu nhỏ">
            <i class="fa-solid fa-magnifying-glass-minus"></i>
          </button>
          <button id="btnResetZoom" class="p-1.5 text-slate-400 hover:text-white text-xs rounded hover:bg-slate-800" title="Về mặc định">
            100%
          </button>
          <button id="btnZoomIn" class="p-1.5 text-slate-400 hover:text-white text-xs rounded hover:bg-slate-800" title="Phóng to">
            <i class="fa-solid fa-magnifying-glass-plus"></i>
          </button>
          <div class="w-px h-4 bg-slate-800 my-auto mx-1"></div>
          <button id="btnExportSVG" class="p-1.5 text-blue-400 hover:text-blue-300 text-xs rounded hover:bg-slate-800 flex items-center gap-1" title="Tải hình SVG">
            <i class="fa-solid fa-download"></i> <span class="hidden sm:inline text-[11px]">Tải SVG</span>
          </button>
        </div>
      </div>

      <!-- Interactive SVG Canvas Area -->
      <div id="svgContainer" class="flex-1 w-full h-full overflow-auto relative cursor-grab active:cursor-grabbing bg-slate-950 flex items-center justify-center p-8 select-none">
        <svg id="flowchartSvg" class="transition-transform duration-150 origin-top-center max-w-full" style="min-width: 600px; min-height: 700px;">
          <!-- SVG Definitions for Markers, Gradients & Filters -->
          <defs>
            <!-- Standard Arrow Head Marker -->
            <marker id="arrowhead" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b" />
            </marker>

            <!-- Active Animated Arrow Marker -->
            <marker id="arrowhead-active" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#38bdf8" />
            </marker>

            <!-- Flowchart Node Shadow Filter -->
            <filter id="dropShadow" x="-10%" y="-10%" width="130%" height="130%">
              <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#000000" flood-opacity="0.5"/>
            </filter>
          </defs>

          <!-- SVG Content Canvas Group -->
          <g id="svgViewport" transform="translate(0, 0) scale(1)">
            <g id="svgEdgesLayer"></g>
            <g id="svgNodesLayer"></g>
          </g>
        </svg>
      </div>

      <!-- Legend Panel -->
      <div class="absolute bottom-3 left-3 bg-slate-900/90 border border-slate-800 backdrop-blur rounded-lg p-2.5 text-[11px] text-slate-300 shadow-xl hidden sm:flex items-center gap-3 z-10">
        <div class="flex items-center gap-1.5">
          <span class="w-3 h-3 rounded-full bg-emerald-500/30 border border-emerald-400"></span> Bắt đầu/Kết thúc
        </div>
        <div class="flex items-center gap-1.5">
          <span class="w-3.5 h-2.5 bg-blue-500/30 border border-blue-400 transform -skew-x-12"></span> Vào/Ra (Input/Print)
        </div>
        <div class="flex items-center gap-1.5">
          <span class="w-3 h-3 bg-indigo-500/30 border border-indigo-400 rotate-45"></span> Điều kiện (If/Loop)
        </div>
        <div class="flex items-center gap-1.5">
          <span class="w-3.5 h-2.5 bg-slate-700 border border-slate-400"></span> Xử lý (Gán)
        </div>
      </div>

    </div>

  </div>

  <!-- Interactive Prompt Input Modal for Python input() statements -->
  <div id="inputModal" class="fixed inset-0 z-50 flex items-center justify-center modal-backdrop hidden">
    <div class="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
      <div class="flex items-center space-x-3 text-blue-400">
        <i class="fa-solid fa-keyboard text-2xl"></i>
        <h3 class="text-base font-bold text-white">Yêu Cầu Nhập Dữ Liệu input()</h3>
      </div>
      <p id="inputModalPrompt" class="text-xs text-slate-300 font-mono bg-slate-950 p-2.5 rounded border border-slate-800">
        Nhập giá trị cho biến:
      </p>
      <div>
        <label for="modalInputValue" class="block text-xs font-semibold text-slate-400 mb-1">Giá trị nhập vào (Số hoặc Chuỗi):</label>
        <input type="text" id="modalInputValue" class="w-full bg-slate-950 border border-slate-700 rounded p-2.5 text-sm text-white focus:outline-none focus:border-blue-500 font-mono" placeholder="Nhập giá trị..." autofocus>
      </div>
      <div class="flex justify-end space-x-2 pt-2">
        <button id="btnSubmitInput" class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5">
          Xác nhận <i class="fa-solid fa-check"></i>
        </button>
      </div>
    </div>
  </div>

  <script>
    /* =========================================================================
     * 1. PRESET CODE EXAMPLES (Chuẩn Tin Học Phổ Thông)
     * ========================================================================= */
    const CODE_PRESETS = {
      preset_swap: `# Ví dụ 1: Cấu trúc tuần tự (Hoán đổi 2 số)
a = int(input("Nhập a: "))
b = int(input("Nhập b: "))
temp = a
a = b
b = temp
print("Sau khi hoán đổi a =", a)
print("Sau khi hoán đổi b =", b)`,

      preset_if: `# Ví dụ 2: Cấu trúc rẽ nhánh (Kiểm tra số n)
n = int(input("Nhập số nguyên n: "))
if n > 0:
    print("n là số DƯƠNG")
elif n < 0:
    print("n là số ÂM")
else:
    print("n bằng KHÔNG")`,

      preset_for: `# Ví dụ 3: Cấu trúc lặp For (Tính tổng từ 1 đến N)
n = int(input("Nhập N: "))
tong = 0
for i in range(1, n + 1):
    tong = tong + i
print("Tổng từ 1 đến", n, "là:", tong)`,

      preset_while: `# Ví dụ 4: Cấu trúc lặp While (Đếm ngược)
n = int(input("Nhập số giây đếm ngược: "))
i = n
while i > 0:
    print("Đếm:", i)
    i = i - 1
print("HẾT GIỜ!")`
    };

    /* =========================================================================
     * 2. PYTHON LINE PARSER & CFG GENERATOR
     * ========================================================================= */
    class PythonASTBuilder {
      static parse(codeText) {
        const rawLines = codeText.split('\n');
        const lines = [];
        
        // Clean lines & preserve line numbers
        rawLines.forEach((text, idx) => {
          const lineNum = idx + 1;
          const trimmed = text.trim();
          if (trimmed.length > 0 && !trimmed.startsWith('#')) {
            const indent = text.search(/\S/);
            lines.push({
              lineNum: lineNum,
              indent: indent >= 0 ? indent : 0,
              text: trimmed,
              raw: text
            });
          }
        });

        // Parse block structures recursively
        let index = 0;
        function parseBlock(minIndent) {
          const stmts = [];
          while (index < lines.length) {
            const cur = lines[index];
            if (cur.indent < minIndent) break;

            if (cur.text.startsWith('if ')) {
              stmts.push(parseIfSequence(cur.indent));
            } else if (cur.text.startsWith('while ')) {
              stmts.push(parseWhile(cur.indent));
            } else if (cur.text.startsWith('for ')) {
              stmts.push(parseFor(cur.indent));
            } else {
              stmts.push({
                type: 'simple',
                lineNum: cur.lineNum,
                text: cur.text
              });
              index++;
            }
          }
          return stmts;
        }

        function parseIfSequence(indent) {
          const cur = lines[index];
          const condText = cur.text.substring(3, cur.text.indexOf(':')).trim();
          index++;
          const thenBody = parseBlock(indent + 1);

          const elifBlocks = [];
          let elseBody = null;

          while (index < lines.length && lines[index].indent === indent) {
            const nextLine = lines[index];
            if (nextLine.text.startsWith('elif ')) {
              const elifCond = nextLine.text.substring(5, nextLine.text.indexOf(':')).trim();
              index++;
              const body = parseBlock(indent + 1);
              elifBlocks.push({ cond: elifCond, lineNum: nextLine.lineNum, body: body });
            } else if (nextLine.text.startsWith('else:')) {
              index++;
              elseBody = parseBlock(indent + 1);
              break;
            } else {
              break;
            }
          }

          return {
            type: 'if',
            lineNum: cur.lineNum,
            condition: condText,
            thenBody: thenBody,
            elifBlocks: elifBlocks,
            elseBody: elseBody
          };
        }

        function parseWhile(indent) {
          const cur = lines[index];
          const condText = cur.text.substring(6, cur.text.indexOf(':')).trim();
          index++;
          const body = parseBlock(indent + 1);
          return {
            type: 'while',
            lineNum: cur.lineNum,
            condition: condText,
            body: body
          };
        }

        function parseFor(indent) {
          const cur = lines[index];
          // e.g. for i in range(1, n + 1):
          const header = cur.text.substring(4, cur.text.indexOf(':')).trim();
          const inIdx = header.indexOf(' in ');
          const varName = header.substring(0, inIdx).trim();
          const rangeExpr = header.substring(inIdx + 4).trim();
          index++;
          const body = parseBlock(indent + 1);
          return {
            type: 'for',
            lineNum: cur.lineNum,
            varName: varName,
            rangeExpr: rangeExpr,
            body: body
          };
        }

        return parseBlock(0);
      }
    }

    /* =========================================================================
     * 3. TEXTBOOK STANDARD FLOWCHART LAYOUT ENGINE
     * ========================================================================= */
    class FlowchartLayoutEngine {
      constructor() {
        this.nodeCounter = 0;
        this.nodes = [];
        this.edges = [];
      }

      createNode(type, label, lineNum, expr = '') {
        const id = 'node_' + (++this.nodeCounter);
        const node = {
          id: id,
          type: type, // 'start', 'end', 'process', 'io', 'decision', 'merge'
          label: label,
          lineNum: lineNum,
          expr: expr,
          x: 0,
          y: 0,
          w: type === 'decision' ? 140 : (type === 'merge' ? 16 : 130),
          h: type === 'decision' ? 70 : (type === 'merge' ? 16 : 46)
        };
        this.nodes.push(node);
        return node;
      }

      addEdge(fromNode, toNode, label = '', edgeType = 'straight') {
        const edge = {
          id: `edge_${fromNode.id}_to_${toNode.id}`,
          from: fromNode.id,
          to: toNode.id,
          fromNode: fromNode,
          toNode: toNode,
          label: label,
          type: edgeType
        };
        this.edges.push(edge);
        return edge;
      }

      buildCFG(ast) {
        this.nodes = [];
        this.edges = [];
        this.nodeCounter = 0;

        const startNode = this.createNode('start', 'Bắt đầu', 0);
        const endNode = this.createNode('end', 'Kết thúc', 999);

        let currentEntry = startNode;

        const buildSequence = (stmts, entryNode) => {
          let lastNode = entryNode;

          stmts.forEach(stmt => {
            if (stmt.type === 'simple') {
              let shapeType = 'process';
              let text = stmt.text;
              if (text.includes('input(') || text.startsWith('print(')) {
                shapeType = 'io';
              }
              const node = this.createNode(shapeType, text, stmt.lineNum, stmt.text);
              this.addEdge(lastNode, node);
              lastNode = node;
            } else if (stmt.type === 'if') {
              lastNode = this.buildIfCFG(stmt, lastNode);
            } else if (stmt.type === 'while') {
              lastNode = this.buildWhileCFG(stmt, lastNode);
            } else if (stmt.type === 'for') {
              lastNode = this.buildForCFG(stmt, lastNode);
            }
          });

          return lastNode;
        };

        const exitNode = buildSequence(ast, startNode);
        this.addEdge(exitNode, endNode);

        // Calculate positions according to textbook layouts
        this.layoutGraph(startNode);

        return { nodes: this.nodes, edges: this.edges, startNode, endNode };
      }

      // IF-ELSE Textbook Layout Generator
      buildIfCFG(ifStmt, entryNode) {
        // Center Decision Diamond
        const decNode = this.createNode('decision', `${ifStmt.condition}?`, ifStmt.lineNum, ifStmt.condition);
        this.addEdge(entryNode, decNode);

        const mergeNode = this.createNode('merge', '', ifStmt.lineNum);

        // TRUE Branch (Goes LEFT according to standard diagram)
        let trueExit = decNode;
        if (ifStmt.thenBody.length > 0) {
          const dummyTrue = { id: 'dummy_true' };
          // We attach edges explicitly
          let last = decNode;
          ifStmt.thenBody.forEach((s, idx) => {
            if (s.type === 'simple') {
              const nType = (s.text.includes('input(') || s.text.startsWith('print(')) ? 'io' : 'process';
              const n = this.createNode(nType, s.text, s.lineNum, s.text);
              if (idx === 0) this.addEdge(decNode, n, 'Đúng', 'branch_left');
              else this.addEdge(last, n);
              last = n;
            } else if (s.type === 'if') last = this.buildIfCFG(s, last);
            else if (s.type === 'while') last = this.buildWhileCFG(s, last);
            else if (s.type === 'for') last = this.buildForCFG(s, last);
          });
          trueExit = last;
          this.addEdge(trueExit, mergeNode, '', 'merge_from_left');
        } else {
          this.addEdge(decNode, mergeNode, 'Đúng', 'direct_merge_left');
        }

        // FALSE Branch (Goes RIGHT according to standard diagram)
        let falseExit = decNode;
        if (ifStmt.elseBody && ifStmt.elseBody.length > 0) {
          let last = decNode;
          ifStmt.elseBody.forEach((s, idx) => {
            if (s.type === 'simple') {
              const nType = (s.text.includes('input(') || s.text.startsWith('print(')) ? 'io' : 'process';
              const n = this.createNode(nType, s.text, s.lineNum, s.text);
              if (idx === 0) this.addEdge(decNode, n, 'Sai', 'branch_right');
              else this.addEdge(last, n);
              last = n;
            } else if (s.type === 'if') last = this.buildIfCFG(s, last);
            else if (s.type === 'while') last = this.buildWhileCFG(s, last);
            else if (s.type === 'for') last = this.buildForCFG(s, last);
          });
          falseExit = last;
          this.addEdge(falseExit, mergeNode, '', 'merge_from_right');
        } else {
          this.addEdge(decNode, mergeNode, 'Sai', 'branch_right_direct');
        }

        return mergeNode;
      }

      // WHILE LOOP Textbook Layout Generator
      buildWhileCFG(whileStmt, entryNode) {
        // Entry point junction before loop
        const loopEntryMerge = this.createNode('merge', '', whileStmt.lineNum);
        this.addEdge(entryNode, loopEntryMerge);

        // Decision Diamond
        const decNode = this.createNode('decision', `${whileStmt.condition}?`, whileStmt.lineNum, whileStmt.condition);
        this.addEdge(loopEntryMerge, decNode);

        // Body executed if TRUE (Goes straight DOWN into loop body)
        let bodyExit = decNode;
        if (whileStmt.body.length > 0) {
          let last = decNode;
          whileStmt.body.forEach((s, idx) => {
            if (s.type === 'simple') {
              const nType = (s.text.includes('input(') || s.text.startsWith('print(')) ? 'io' : 'process';
              const n = this.createNode(nType, s.text, s.lineNum, s.text);
              if (idx === 0) this.addEdge(decNode, n, 'Đúng', 'straight_down');
              else this.addEdge(last, n);
              last = n;
            } else if (s.type === 'if') last = this.buildIfCFG(s, last);
            else if (s.type === 'while') last = this.buildWhileCFG(s, last);
            else if (s.type === 'for') last = this.buildForCFG(s, last);
          });
          bodyExit = last;
        }

        // Loop back edge: from body exit, turn LEFT and loop UP into loopEntryMerge
        this.addEdge(bodyExit, loopEntryMerge, '', 'loop_back_left');

        // FALSE Exit: turns RIGHT, goes down past loop body to merge
        const loopExitMerge = this.createNode('merge', '', whileStmt.lineNum);
        this.addEdge(decNode, loopExitMerge, 'Sai', 'loop_exit_right');

        return loopExitMerge;
      }

      // FOR LOOP Textbook Layout Generator
      buildForCFG(forStmt, entryNode) {
        const condLabel = `${forStmt.varName} in ${forStmt.rangeExpr}`;
        const loopEntryMerge = this.createNode('merge', '', forStmt.lineNum);
        this.addEdge(entryNode, loopEntryMerge);

        const decNode = this.createNode('decision', `${condLabel}?`, forStmt.lineNum, condLabel);
        this.addEdge(loopEntryMerge, decNode);

        let bodyExit = decNode;
        if (forStmt.body.length > 0) {
          let last = decNode;
          forStmt.body.forEach((s, idx) => {
            if (s.type === 'simple') {
              const nType = (s.text.includes('input(') || s.text.startsWith('print(')) ? 'io' : 'process';
              const n = this.createNode(nType, s.text, s.lineNum, s.text);
              if (idx === 0) this.addEdge(decNode, n, 'Đúng', 'straight_down');
              else this.addEdge(last, n);
              last = n;
            } else if (s.type === 'if') last = this.buildIfCFG(s, last);
            else if (s.type === 'while') last = this.buildWhileCFG(s, last);
            else if (s.type === 'for') last = this.buildForCFG(s, last);
          });
          bodyExit = last;
        }

        this.addEdge(bodyExit, loopEntryMerge, '', 'loop_back_left');

        const loopExitMerge = this.createNode('merge', '', forStmt.lineNum);
        this.addEdge(decNode, loopExitMerge, 'Sai', 'loop_exit_right');

        return loopExitMerge;
      }

      /* Coordinate layout assignment following standard layout parameters */
      layoutGraph(startNode) {
        const startX = 320;
        let currentY = 50;
        const gapY = 75;
        const branchDistX = 170;

        // Simple vertical layout with standard offsets
        const visited = new Set();

        const positionNode = (node, x, y) => {
          node.x = x;
          node.y = y;
        };

        // Linear layout pass with branch offset handling
        let currY = currentY;
        this.nodes.forEach((node) => {
          node.x = startX;
          node.y = currY;
          currY += gapY;
        });

        // Adjust coordinates for decisions and loops
        this.edges.forEach(edge => {
          if (edge.type === 'branch_left') {
            edge.toNode.x = edge.fromNode.x - branchDistX;
            edge.toNode.y = edge.fromNode.y + 60;
          } else if (edge.type === 'branch_right' || edge.type === 'branch_right_direct') {
            edge.toNode.x = edge.fromNode.x + branchDistX;
            edge.toNode.y = edge.fromNode.y + 60;
          } else if (edge.type === 'loop_exit_right') {
            edge.toNode.x = edge.fromNode.x;
            // Position exit merge below the loop body
            edge.toNode.y = edge.fromNode.y + 160;
          }
        });
      }
    }

    /* =========================================================================
     * 4. SVG FLOWCHART RENDERER
     * ========================================================================= */
    class SVGFlowchartRenderer {
      constructor(svgElem, viewportElem) {
        this.svg = svgElem;
        this.viewport = viewportElem;
        this.nodesGroup = svgElem.querySelector('#svgNodesLayer');
        this.edgesGroup = svgElem.querySelector('#svgEdgesLayer');
      }

      render(nodes, edges) {
        this.nodesGroup.innerHTML = '';
        this.edgesGroup.innerHTML = '';

        // Render Edges
        edges.forEach(edge => {
          this.renderEdge(edge);
        });

        // Render Nodes
        nodes.forEach(node => {
          this.renderNode(node);
        });

        // Adjust SVG ViewBox Dimensions
        let maxX = 600, maxY = 700;
        nodes.forEach(n => {
          if (n.x + 200 > maxX) maxX = n.x + 200;
          if (n.y + 150 > maxY) maxY = n.y + 150;
        });
        this.svg.setAttribute('viewBox', `0 0 ${maxX} ${maxY}`);
      }

      renderNode(node) {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('class', 'fc-node');
        g.setAttribute('id', `svg_${node.id}`);
        g.setAttribute('data-node-id', node.id);

        let shape;
        const w = node.w;
        const h = node.h;
        const x = node.x - w / 2;
        const y = node.y - h / 2;

        if (node.type === 'start' || node.type === 'end') {
          // Pill Oval Shape (Bắt đầu / Kết thúc)
          shape = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
          shape.setAttribute('x', x);
          shape.setAttribute('y', y);
          shape.setAttribute('width', w);
          shape.setAttribute('height', h);
          shape.setAttribute('rx', h / 2);
          shape.setAttribute('ry', h / 2);
          shape.setAttribute('fill', node.type === 'start' ? '#065f46' : '#881337');
          shape.setAttribute('stroke', node.type === 'start' ? '#34d399' : '#f43f5e');
          shape.setAttribute('stroke-width', '2');
          shape.setAttribute('filter', 'url(#dropShadow)');
        } else if (node.type === 'io') {
          // Parallelogram Shape (Nhập / Xuất)
          shape = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
          const skew = 14;
          const points = `${x + skew},${y} ${x + w},${y} ${x + w - skew},${y + h} ${x},${y + h}`;
          shape.setAttribute('points', points);
          shape.setAttribute('fill', '#1e3a8a');
          shape.setAttribute('stroke', '#60a5fa');
          shape.setAttribute('stroke-width', '2');
          shape.setAttribute('filter', 'url(#dropShadow)');
        } else if (node.type === 'decision') {
          // Diamond Shape (Điều kiện rẽ nhánh / lặp)
          shape = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
          const cx = node.x, cy = node.y;
          const points = `${cx},${cy - h/2} ${cx + w/2},${cy} ${cx},${cy + h/2} ${cx - w/2},${cy}`;
          shape.setAttribute('points', points);
          shape.setAttribute('fill', '#312e81');
          shape.setAttribute('stroke', '#818cf8');
          shape.setAttribute('stroke-width', '2');
          shape.setAttribute('filter', 'url(#dropShadow)');
        } else if (node.type === 'merge') {
          // Merge Node Dot
          shape = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          shape.setAttribute('cx', node.x);
          shape.setAttribute('cy', node.y);
          shape.setAttribute('r', '6');
          shape.setAttribute('fill', '#38bdf8');
          shape.setAttribute('stroke', '#0284c7');
          shape.setAttribute('stroke-width', '2');
        } else {
          // Process Rectangle (Gán / Tính toán)
          shape = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
          shape.setAttribute('x', x);
          shape.setAttribute('y', y);
          shape.setAttribute('width', w);
          shape.setAttribute('height', h);
          shape.setAttribute('rx', '6');
          shape.setAttribute('fill', '#1e293b');
          shape.setAttribute('stroke', '#94a3b8');
          shape.setAttribute('stroke-width', '2');
          shape.setAttribute('filter', 'url(#dropShadow)');
        }

        g.appendChild(shape);

        // Text Label Inside Node
        if (node.type !== 'merge') {
          const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          text.setAttribute('x', node.x);
          text.setAttribute('y', node.y + 4);
          text.setAttribute('text-anchor', 'middle');
          text.setAttribute('fill', '#f1f5f9');
          text.setAttribute('font-size', '11px');
          text.setAttribute('font-family', 'JetBrains Mono, monospace');
          
          // Truncate long text labels safely
          let displayText = node.label;
          if (displayText.length > 18) displayText = displayText.substring(0, 16) + '..';
          text.textContent = displayText;

          g.appendChild(text);
        }

        this.nodesGroup.appendChild(g);
      }

      renderEdge(edge) {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('id', edge.id);
        path.setAttribute('class', 'fc-edge');
        path.setAttribute('marker-end', 'url(#arrowhead)');

        const fn = edge.fromNode;
        const tn = edge.toNode;
        let d = '';

        // Orthogonal Edge Path Calculations
        if (edge.type === 'branch_left') {
          // Turn Left, then Down to target node
          d = `M ${fn.x - fn.w/2} ${fn.y} L ${tn.x} ${fn.y} L ${tn.x} ${tn.y - tn.h/2}`;
          this.renderTextLabel((fn.x - fn.w/2 + tn.x)/2, fn.y - 8, edge.label || 'Đúng', '#34d399');
        } else if (edge.type === 'branch_right' || edge.type === 'branch_right_direct') {
          // Turn Right, then Down to target node
          d = `M ${fn.x + fn.w/2} ${fn.y} L ${tn.x} ${fn.y} L ${tn.x} ${tn.y - tn.h/2}`;
          this.renderTextLabel((fn.x + fn.w/2 + tn.x)/2, fn.y - 8, edge.label || 'Sai', '#f43f5e');
        } else if (edge.type === 'merge_from_left') {
          // From Left branch down to merge center
          d = `M ${fn.x} ${fn.y + fn.h/2} L ${fn.x} ${tn.y} L ${tn.x} ${tn.y}`;
        } else if (edge.type === 'merge_from_right') {
          // From Right branch down to merge center
          d = `M ${fn.x} ${fn.y + fn.h/2} L ${fn.x} ${tn.y} L ${tn.x} ${tn.y}`;
        } else if (edge.type === 'loop_back_left') {
          // Loop Back: turns LEFT, goes UP, turns RIGHT into loop entry merge
          const offsetLeft = 120;
          const loopX = fn.x - offsetLeft;
          d = `M ${fn.x - fn.w/2} ${fn.y} L ${loopX} ${fn.y} L ${loopX} ${tn.y} L ${tn.x - 8} ${tn.y}`;
        } else if (edge.type === 'loop_exit_right') {
          // Loop Exit: turns RIGHT from diamond, goes DOWN past loop body, turns LEFT to center
          const offsetRight = 130;
          const exitX = fn.x + offsetRight;
          d = `M ${fn.x + fn.w/2} ${fn.y} L ${exitX} ${fn.y} L ${exitX} ${tn.y} L ${tn.x} ${tn.y}`;
          this.renderTextLabel((fn.x + fn.w/2 + exitX)/2, fn.y - 8, 'Sai', '#f43f5e');
        } else {
          // Straight Vertical Line
          d = `M ${fn.x} ${fn.y + fn.h/2} L ${tn.x} ${tn.y - tn.h/2}`;
          if (edge.label) {
            this.renderTextLabel(fn.x + 12, (fn.y + tn.y)/2, edge.label, '#34d399');
          }
        }

        path.setAttribute('d', d);
        this.edgesGroup.appendChild(path);
      }

      renderTextLabel(x, y, textStr, color = '#94a3b8') {
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', x);
        text.setAttribute('y', y);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('fill', color);
        text.setAttribute('font-size', '10px');
        text.setAttribute('font-weight', 'bold');
        text.setAttribute('font-family', 'Inter, sans-serif');
        text.textContent = textStr;
        this.edgesGroup.appendChild(text);
      }
    }

    /* =========================================================================
     * 5. PYTHON INTERPRETER & STEP EXECUTION TRACER
     * ========================================================================= */
    class PythonInterpreter {
      constructor() {
        this.variables = {};
        this.output = [];
        this.steps = [];
        this.inputQueue = [];
      }

      // Safe evaluation of Python expressions in JS context
      evalExpr(expr, scope) {
        try {
          // Replace Python operators with JS equivalents
          let jsExpr = expr
            .replace(/\band\b/g, '&&')
            .replace(/\bor\b/g, '||')
            .replace(/\bnot\b/g, '!')
            .replace(/True/g, 'true')
            .replace(/False/g, 'false');

          // Build context scope evaluation string
          const keys = Object.keys(scope);
          const vals = Object.values(scope);
          const func = new Function(...keys, `return (${jsExpr});`);
          return func(...vals);
        } catch (err) {
          console.warn('Evaluation error:', expr, err);
          return 0;
        }
      }

      async generateTrace(ast, nodes, edges, inputProvider) {
        this.variables = {};
        this.output = [];
        this.steps = [];

        // Helper to find matching flowchart node by line number & type
        const findNode = (lineNum, shapeType = null) => {
          return nodes.find(n => n.lineNum === lineNum && (!shapeType || n.type === shapeType)) || nodes[0];
        };

        const addStep = (node, lineNum, explanation, actionType = 'exec') => {
          this.steps.push({
            stepIndex: this.steps.length + 1,
            lineNum: lineNum,
            nodeId: node ? node.id : null,
            explanation: explanation,
            variables: JSON.parse(JSON.stringify(this.variables)),
            outputSnapshot: [...this.output],
            actionType: actionType
          });
        };

        addStep(nodes[0], 0, 'Bắt đầu chương trình Python.', 'start');

        // Recursive AST Interpreter Step Generator
        const executeBlock = async (stmts) => {
          for (const stmt of stmts) {
            if (stmt.type === 'simple') {
              const text = stmt.text;
              const node = findNode(stmt.lineNum);

              if (text.includes('input(')) {
                // Input Prompt Handling
                const varName = text.split('=')[0].trim();
                let promptMsg = `Nhập giá trị cho ${varName}`;
                const promptMatch = text.match(/input\((.*?)\)/);
                if (promptMatch && promptMatch[1]) {
                  promptMsg = promptMatch[1].replace(/['"]/g, '');
                }

                // Request user input dynamically
                const valStr = await inputProvider(promptMsg, varName);
                let val = valStr;
                if (text.includes('int(')) val = parseInt(valStr, 10) || 0;
                else if (text.includes('float(')) val = parseFloat(valStr) || 0;

                this.variables[varName] = val;
                addStep(node, stmt.lineNum, `Nhập dữ liệu: Đã gán ${varName} = ${val}`);

              } else if (text.startsWith('print(')) {
                // Print Statement Handling
                const content = text.substring(6, text.length - 1);
                // Parse arguments separated by comma
                const args = content.split(',').map(a => a.trim());
                const printedValues = args.map(arg => {
                  if ((arg.startsWith('"') && arg.endsWith('"')) || (arg.startsWith("'") && arg.endsWith("'"))) {
                    return arg.slice(1, -1);
                  }
                  return this.evalExpr(arg, this.variables);
                });

                const outStr = printedValues.join(' ');
                this.output.push(outStr);
                addStep(node, stmt.lineNum, `Xuất dữ liệu màn hình (Terminal): "${outStr}"`);

              } else if (text.includes('=')) {
                // Variable Assignment Statement
                const parts = text.split('=');
                const varName = parts[0].trim();
                const expr = parts[1].trim();
                const result = this.evalExpr(expr, this.variables);
                this.variables[varName] = result;
                addStep(node, stmt.lineNum, `Tính toán & Gán biến: ${varName} = ${result}`);
              }

            } else if (stmt.type === 'if') {
              const node = findNode(stmt.lineNum, 'decision');
              const condVal = !!this.evalExpr(stmt.condition, this.variables);

              addStep(node, stmt.lineNum, `Đánh giá điều kiện [${stmt.condition}] ➔ KẾT QUẢ: ${condVal ? 'ĐÚNG (True)' : 'SAI (False)'}`);

              if (condVal) {
                await executeBlock(stmt.thenBody);
              } else {
                let executedElif = false;
                if (stmt.elifBlocks) {
                  for (const elifBlock of stmt.elifBlocks) {
                    const elifNode = findNode(elifBlock.lineNum, 'decision');
                    const elifVal = !!this.evalExpr(elifBlock.cond, this.variables);
                    addStep(elifNode, elifBlock.lineNum, `Đánh giá điều kiện elif [${elifBlock.cond}] ➔ KẾT QUẢ: ${elifVal ? 'ĐÚNG (True)' : 'SAI (False)'}`);
                    if (elifVal) {
                      await executeBlock(elifBlock.body);
                      executedElif = true;
                      break;
                    }
                  }
                }
                if (!executedElif && stmt.elseBody) {
                  await executeBlock(stmt.elseBody);
                }
              }

            } else if (stmt.type === 'while') {
              const decNode = findNode(stmt.lineNum, 'decision');
              let loopCount = 0;

              while (loopCount < 100) { // Safety loop limit guard
                const condVal = !!this.evalExpr(stmt.condition, this.variables);
                addStep(decNode, stmt.lineNum, `Kiểm tra điều kiện vòng lặp While [${stmt.condition}] ➔ KẾT QUẢ: ${condVal ? 'ĐÚNG ➔ Vào thân vòng lặp' : 'SAI ➔ Thoát vòng lặp'}`);

                if (!condVal) break;
                await executeBlock(stmt.body);
                loopCount++;
              }

            } else if (stmt.type === 'for') {
              const decNode = findNode(stmt.lineNum, 'decision');
              
              // Evaluate Python range(start, end, step)
              let start = 0, end = 0, step = 1;
              const rangeMatch = stmt.rangeExpr.match(/range\((.*?)\)/);
              if (rangeMatch) {
                const args = rangeMatch[1].split(',').map(a => this.evalExpr(a.trim(), this.variables));
                if (args.length === 1) {
                  end = args[0];
                } else if (args.length === 2) {
                  start = args[0];
                  end = args[1];
                } else if (args.length === 3) {
                  start = args[0];
                  end = args[1];
                  step = args[2];
                }
              }

              for (let i = start; step > 0 ? i < end : i > end; i += step) {
                this.variables[stmt.varName] = i;
                addStep(decNode, stmt.lineNum, `Vòng lặp For: Đặt ${stmt.varName} = ${i}. Điều kiện (${i} < ${end}) ➔ ĐÚNG`);
                await executeBlock(stmt.body);
              }

              addStep(decNode, stmt.lineNum, `Vòng lặp For kết thúc. Biến ${stmt.varName} đạt giới hạn.`);
            }
          }
        };

        await executeBlock(ast);

        const endNode = nodes.find(n => n.type === 'end') || nodes[nodes.length - 1];
        addStep(endNode, 999, 'Kết thúc chương trình thành công!', 'end');

        return this.steps;
      }
    }

    /* =========================================================================
     * 6. MAIN APPLICATION CONTROLLER & UI BINDINGS
     * ========================================================================= */
    document.addEventListener('DOMContentLoaded', () => {
      // UI Elements
      const presetSelect = document.getElementById('presetSelect');
      const codeInput = document.getElementById('pythonCodeInput');
      const lineNumbers = document.getElementById('lineNumbers');
      const codeHighlights = document.getElementById('codeHighlights');
      
      const btnBuildFlow = document.getElementById('btnBuildFlow');
      const btnStartSim = document.getElementById('btnStartSim');
      const btnStepNext = document.getElementById('btnStepNext');
      const btnStepPrev = document.getElementById('btnStepPrev');
      const btnResetSim = document.getElementById('btnResetSim');
      const speedRange = document.getElementById('speedRange');

      const stepCounterText = document.getElementById('stepCounterText');
      const stepPercentage = document.getElementById('stepPercentage');
      const stepExplanation = document.getElementById('stepExplanation');
      const variablesTableBody = document.getElementById('variablesTableBody');
      const terminalOutput = document.getElementById('terminalOutput');
      const btnClearTerminal = document.getElementById('btnClearTerminal');

      const svgContainer = document.getElementById('svgContainer');
      const flowchartSvg = document.getElementById('flowchartSvg');
      const svgViewport = document.getElementById('svgViewport');

      const btnZoomIn = document.getElementById('btnZoomIn');
      const btnZoomOut = document.getElementById('btnZoomOut');
      const btnResetZoom = document.getElementById('btnResetZoom');
      const btnExportSVG = document.getElementById('btnExportSVG');

      // Modal Input elements
      const inputModal = document.getElementById('inputModal');
      const inputModalPrompt = document.getElementById('inputModalPrompt');
      const modalInputValue = document.getElementById('modalInputValue');
      const btnSubmitInput = document.getElementById('btnSubmitInput');

      // Navigation Tabs
      const tabBtnEditor = document.getElementById('tabBtnEditor');
      const tabBtnOnlinePython = document.getElementById('tabBtnOnlinePython');
      const tabContentEditor = document.getElementById('tabContentEditor');
      const tabContentOnlinePython = document.getElementById('tabContentOnlinePython');

      // Flowchart Engine Instances
      const layoutEngine = new FlowchartLayoutEngine();
      const svgRenderer = new SVGFlowchartRenderer(flowchartSvg, svgViewport);
      const interpreter = new PythonInterpreter();

      // Application State Variables
      let currentAST = null;
      let currentGraph = null;
      let traceSteps = [];
      let currentStepIdx = -1;
      let autoPlayInterval = null;
      let zoomLevel = 1.0;
      let pendingInputResolver = null;

      // Set default initial code preset
      codeInput.value = CODE_PRESETS.preset_if;
      updateLineNumbers();

      /* Code Editor Line Number Updater */
      function updateLineNumbers() {
        const lines = codeInput.value.split('\n').length;
        lineNumbers.innerHTML = Array.from({ length: lines }, (_, i) => i + 1).join('<br>');
      }

      codeInput.addEventListener('input', () => {
        updateLineNumbers();
        resetSimulation();
      });

      // Preset Change Listener
      presetSelect.addEventListener('change', (e) => {
        if (CODE_PRESETS[e.target.value]) {
          codeInput.value = CODE_PRESETS[e.target.value];
          updateLineNumbers();
          buildAndRenderFlowchart();
        }
      });

      // Tab Switching
      tabBtnEditor.addEventListener('click', () => {
        tabBtnEditor.classList.add('border-blue-500', 'text-blue-400', 'font-semibold');
        tabBtnEditor.classList.remove('border-transparent');
        tabBtnOnlinePython.classList.remove('border-blue-500', 'text-blue-400', 'font-semibold');
        tabBtnOnlinePython.classList.add('border-transparent');
        
        tabContentEditor.classList.remove('hidden');
        tabContentOnlinePython.classList.add('hidden');
        tabContentEditor.classList.add('flex');
      });

      tabBtnOnlinePython.addEventListener('click', () => {
        tabBtnOnlinePython.classList.add('border-blue-500', 'text-blue-400', 'font-semibold');
        tabBtnOnlinePython.classList.remove('border-transparent');
        tabBtnEditor.classList.remove('border-blue-500', 'text-blue-400', 'font-semibold');
        tabBtnEditor.classList.add('border-transparent');

        tabContentOnlinePython.classList.remove('hidden');
        tabContentEditor.classList.add('hidden');
        tabContentOnlinePython.classList.add('flex');
      });

      /* Build & Render Flowchart */
      function buildAndRenderFlowchart() {
        resetSimulation();
        const codeText = codeInput.value;
        try {
          currentAST = PythonASTBuilder.parse(codeText);
          currentGraph = layoutEngine.buildCFG(currentAST);
          svgRenderer.render(currentGraph.nodes, currentGraph.edges);
          terminalOutput.textContent = '> Lưu đồ đã được khởi tạo thành công theo quy chuẩn tin học.';
        } catch (err) {
          console.error('Build Error:', err);
          terminalOutput.textContent = '> Lỗi cú pháp mã nguồn: ' + err.message;
        }
      }

      btnBuildFlow.addEventListener('click', buildAndRenderFlowchart);

      /* Input Modal Helper */
      function requestUserInput(promptMsg, varName) {
        return new Promise((resolve) => {
          pendingInputResolver = resolve;
          inputModalPrompt.textContent = `${promptMsg} (Nhập cho biến ${varName}):`;
          modalInputValue.value = '5'; // Smart default value for demo ease
          inputModal.classList.remove('hidden');
          modalInputValue.focus();
        });
      }

      btnSubmitInput.addEventListener('click', () => {
        if (pendingInputResolver) {
          const val = modalInputValue.value;
          inputModal.classList.add('hidden');
          pendingInputResolver(val);
          pendingInputResolver = null;
        }
      });

      modalInputValue.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') btnSubmitInput.click();
      });

      /* Start Simulation Execution Trace */
      async function startSimulation() {
        if (!currentGraph) buildAndRenderFlowchart();

        btnStartSim.disabled = true;
        stepCounterText.textContent = 'Trạng thái: Đang phân tích...';

        try {
          traceSteps = await interpreter.generateTrace(
            currentAST,
            currentGraph.nodes,
            currentGraph.edges,
            requestUserInput
          );

          currentStepIdx = 0;
          renderStep(currentStepIdx);

          btnStepNext.disabled = false;
          btnStepPrev.disabled = true;
          btnStartSim.disabled = false;
          btnStartSim.innerHTML = '<i class="fa-solid fa-pause"></i> Tạm dừng';
          
          // Start autoplay timer
          startAutoPlay();

        } catch (err) {
          console.error('Execution Error:', err);
          btnStartSim.disabled = false;
          btnStartSim.innerHTML = '<i class="fa-solid fa-play"></i> Mô phỏng';
        }
      }

      btnStartSim.addEventListener('click', () => {
        if (autoPlayInterval) {
          stopAutoPlay();
        } else if (traceSteps.length > 0 && currentStepIdx < traceSteps.length - 1) {
          startAutoPlay();
        } else {
          startSimulation();
        }
      });

      function startAutoPlay() {
        stopAutoPlay();
        const speed = 2000 - parseInt(speedRange.value, 10);
        autoPlayInterval = setInterval(() => {
          if (currentStepIdx < traceSteps.length - 1) {
            currentStepIdx++;
            renderStep(currentStepIdx);
          } else {
            stopAutoPlay();
          }
        }, speed);
        btnStartSim.innerHTML = '<i class="fa-solid fa-pause"></i> Tạm dừng';
      }

      function stopAutoPlay() {
        if (autoPlayInterval) {
          clearInterval(autoPlayInterval);
          autoPlayInterval = null;
        }
        btnStartSim.innerHTML = '<i class="fa-solid fa-play"></i> Tiếp tục';
      }

      btnStepNext.addEventListener('click', () => {
        stopAutoPlay();
        if (currentStepIdx < traceSteps.length - 1) {
          currentStepIdx++;
          renderStep(currentStepIdx);
        }
      });

      btnStepPrev.addEventListener('click', () => {
        stopAutoPlay();
        if (currentStepIdx > 0) {
          currentStepIdx--;
          renderStep(currentStepIdx);
        }
      });

      btnResetSim.addEventListener('click', resetSimulation);

      function resetSimulation() {
        stopAutoPlay();
        traceSteps = [];
        currentStepIdx = -1;
        
        btnStepNext.disabled = true;
        btnStepPrev.disabled = true;
        btnStartSim.disabled = false;
        btnStartSim.innerHTML = '<i class="fa-solid fa-play"></i> Mô phỏng';

        stepCounterText.textContent = 'Trạng thái: Sẵn sàng';
        stepPercentage.textContent = 'Bước 0/0';
        stepExplanation.innerHTML = '<p class="text-slate-500 italic">Nhấn [▶ Mô phỏng] để chạy từng bước.</p>';
        variablesTableBody.innerHTML = '<tr><td colspan="2" class="text-slate-600 text-[11px] py-2 italic">Chưa có biến</td></tr>';
        terminalOutput.textContent = '> System ready.';

        // Clear active highlights on SVG & Code
        document.querySelectorAll('.fc-node').forEach(el => el.classList.remove('active'));
        document.querySelectorAll('.fc-edge').forEach(el => el.classList.remove('active'));
        codeHighlights.innerHTML = '';
      }

      /* Render Specific Execution Trace Step */
      function renderStep(idx) {
        if (idx < 0 || idx >= traceSteps.length) return;

        const step = traceSteps[idx];

        // 1. Update Progress Header
        stepCounterText.textContent = `Trạng thái: Đang thực thi bước ${step.stepIndex}`;
        stepPercentage.textContent = `Bước ${step.stepIndex}/${traceSteps.length}`;

        btnStepPrev.disabled = (idx === 0);
        btnStepNext.disabled = (idx === traceSteps.length - 1);

        // 2. Highlight Code Line
        highlightCodeLine(step.lineNum);

        // 3. Highlight SVG Flowchart Node & Connecting Arrow Edge
        highlightSvgNode(step.nodeId);

        // 4. Update Explanation Box
        stepExplanation.innerHTML = `
          <div class="flex items-start gap-2">
            <span class="px-1.5 py-0.5 bg-blue-500/20 text-blue-400 font-mono text-[10px] rounded font-bold">Dòng ${step.lineNum}</span>
            <p class="text-xs text-slate-200 leading-relaxed">${step.explanation}</p>
          </div>
        `;

        // 5. Update Variable State Watcher Table
        renderVariablesTable(step.variables);

        // 6. Update Terminal Output Snapshot
        if (step.outputSnapshot.length > 0) {
          terminalOutput.textContent = step.outputSnapshot.map(o => `> ${o}`).join('\n');
        } else {
          terminalOutput.textContent = '> Execution running...';
        }
      }

      function highlightCodeLine(lineNum) {
        codeHighlights.innerHTML = '';
        if (!lineNum || lineNum <= 0) return;

        const lineDiv = document.createElement('div');
        lineDiv.style.top = `${(lineNum - 1) * 24}px`;
        lineDiv.style.height = '24px';
        lineDiv.className = 'absolute w-full line-active pointer-events-none';
        codeHighlights.appendChild(lineDiv);
      }

      function highlightSvgNode(nodeId) {
        document.querySelectorAll('.fc-node').forEach(el => el.classList.remove('active'));
        document.querySelectorAll('.fc-edge').forEach(el => el.classList.remove('active'));

        if (!nodeId) return;

        const targetNodeGroup = document.getElementById(`svg_${nodeId}`);
        if (targetNodeGroup) {
          targetNodeGroup.classList.add('active');

          // Highlight connected incoming/outgoing active edge animation
          const edges = currentGraph.edges.filter(e => e.from === nodeId || e.to === nodeId);
          edges.forEach(edge => {
            const pathElem = document.getElementById(edge.id);
            if (pathElem) pathElem.classList.add('active');
          });
        }
      }

      function renderVariablesTable(vars) {
        const keys = Object.keys(vars);
        if (keys.length === 0) {
          variablesTableBody.innerHTML = '<tr><td colspan="2" class="text-slate-600 text-[11px] py-2 italic">Chưa có biến</td></tr>';
          return;
        }

        variablesTableBody.innerHTML = keys.map(k => `
          <tr class="border-b border-slate-800/40">
            <td class="py-1 font-semibold text-amber-300">${k}</td>
            <td class="py-1 text-slate-200">${vars[k]}</td>
          </tr>
        `).join('');
      }

      btnClearTerminal.addEventListener('click', () => {
        terminalOutput.textContent = '> Terminal cleared.';
      });

      /* SVG Zoom & Pan Controls */
      btnZoomIn.addEventListener('click', () => {
        zoomLevel = Math.min(zoomLevel + 0.15, 2.0);
        applySvgZoom();
      });

      btnZoomOut.addEventListener('click', () => {
        zoomLevel = Math.max(zoomLevel - 0.15, 0.5);
        applySvgZoom();
      });

      btnResetZoom.addEventListener('click', () => {
        zoomLevel = 1.0;
        applySvgZoom();
      });

      function applySvgZoom() {
        flowchartSvg.style.transform = `scale(${zoomLevel})`;
        btnResetZoom.textContent = `${Math.round(zoomLevel * 100)}%`;
      }

      /* Export SVG Image Handler */
      btnExportSVG.addEventListener('click', () => {
        const svgData = flowchartSvg.outerHTML;
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const svgUrl = URL.createObjectURL(svgBlob);
        const downloadLink = document.createElement('a');
        downloadLink.href = svgUrl;
        downloadLink.download = 'python_flowchart.svg';
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      });

      // Initial Flowchart Rendering
      buildAndRenderFlowchart();
    });
  </script>
</body>
</html>
