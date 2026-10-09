/* =========================================================================
 * 1. PRESET PYTHON CODE EXAMPLES (Standards for Vietnamese Informatics)
 * ========================================================================= */
const CODE_PRESETS = {
  preset_if: `# Ví dụ 1: Cấu trúc rẽ nhánh (Kiểm tra số n)
n = int(input("Nhập số n: "))
if n > 0:
    print("n là SỐ DƯƠNG")
elif n < 0:
    print("n là SỐ ÂM")
else:
    print("n bằng KHÔNG")`,

  preset_while: `# Ví dụ 2: Cấu trúc lặp While (Tính tổng S = 1 + ... + N)
n = int(input("Nhập N: "))
s = 0
i = 1
while i <= n:
    s = s + i
    i = i + 1
print("Tổng S là:", s)`,

  preset_evenodd: `# Ví dụ 3: Cấu trúc rẽ nhánh (Chẵn hay Lẻ)
n = int(input("Nhập số n: "))
if n % 2 == 0:
    print("n là SỐ CHẴN")
else:
    print("n là SỐ LẺ")`,

  preset_for: `# Ví dụ 4: Cấu trúc lặp For (Đếm & Tính giai thừa)
n = int(input("Nhập n: "))
gt = 1
for i in range(1, n + 1):
    gt = gt * i
print("Giai thừa n! =", gt)`,

  preset_avg: `# Ví dụ 5: Tuần tự (Tính trung bình cộng 2 số)
a = float(input("Nhập số thứ nhất a: "))
b = float(input("Nhập số thứ hai b: "))
tb = (a + b) / 2
print("Trung bình cộng là:", tb)`
};

/* =========================================================================
 * 2. PURE JAVASCRIPT PYTHON AST PARSER
 * ========================================================================= */
class PythonASTBuilder {
  static parse(codeText) {
    const rawLines = codeText.split('\n');
    const lines = [];

    rawLines.forEach((text, idx) => {
      const lineNum = idx + 1;
      const trimmed = text.trim();
      if (trimmed.length > 0 && !trimmed.startsWith('#')) {
        const indent = text.search(/\S/);
        lines.push({ lineNum, indent: indent >= 0 ? indent : 0, text: trimmed });
      }
    });

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
          stmts.push({ type: 'simple', lineNum: cur.lineNum, text: cur.text });
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
          elifBlocks.push({ cond: elifCond, lineNum: nextLine.lineNum, body });
        } else if (nextLine.text.startsWith('else:')) {
          index++;
          elseBody = parseBlock(indent + 1);
          break;
        } else {
          break;
        }
      }

      return { type: 'if', lineNum: cur.lineNum, condition: condText, thenBody, elifBlocks, elseBody };
    }

    function parseWhile(indent) {
      const cur = lines[index];
      const condText = cur.text.substring(6, cur.text.indexOf(':')).trim();
      index++;
      const body = parseBlock(indent + 1);
      return { type: 'while', lineNum: cur.lineNum, condition: condText, body };
    }

    function parseFor(indent) {
      const cur = lines[index];
      const header = cur.text.substring(4, cur.text.indexOf(':')).trim();
      const inIdx = header.indexOf(' in ');
      const varName = header.substring(0, inIdx).trim();
      const rangeExpr = header.substring(inIdx + 4).trim();
      index++;
      const body = parseBlock(indent + 1);
      return { type: 'for', lineNum: cur.lineNum, varName, rangeExpr, body };
    }

    return parseBlock(0);
  }
}

/* =========================================================================
 * 3. FLOWCHART GRAPH BUILDER
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
      x: 320,
      y: 0,
      w: type === 'decision' ? 140 : (type === 'merge' ? 14 : 130),
      h: type === 'decision' ? 70 : (type === 'merge' ? 14 : 46)
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

    const startNode = this.createNode('start', 'BẮT ĐẦU', 0);
    const endNode = this.createNode('end', 'KẾT THÚC', 9999);

    const buildBlock = (stmts, entryNode) => {
      let lastNode = entryNode;

      stmts.forEach(stmt => {
        if (stmt.type === 'simple') {
          let shapeType = 'process';
          if (stmt.text.includes('input(') || stmt.text.startsWith('print(')) {
            shapeType = 'io';
          }
          const node = this.createNode(shapeType, stmt.text, stmt.lineNum, stmt.text);
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

    const mainExitNode = buildBlock(ast, startNode);
    this.addEdge(mainExitNode, endNode);

    this.calculateLayoutPositions(startNode, endNode);

    return { nodes: this.nodes, edges: this.edges, startNode, endNode };
  }

  buildIfCFG(ifStmt, entryNode) {
    const decNode = this.createNode('decision', `${ifStmt.condition}?`, ifStmt.lineNum, ifStmt.condition);
    this.addEdge(entryNode, decNode);

    const mergeNode = this.createNode('merge', '', ifStmt.lineNum);

    let trueExit = decNode;
    if (ifStmt.thenBody.length > 0) {
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
      this.addEdge(decNode, mergeNode, 'Đúng', 'branch_left_direct');
    }

    let falseExit = decNode;
    if (ifStmt.elifBlocks && ifStmt.elifBlocks.length > 0) {
      let lastDecision = decNode;
      ifStmt.elifBlocks.forEach(eb => {
        const elifDecNode = this.createNode('decision', `${eb.cond}?`, eb.lineNum, eb.cond);
        this.addEdge(lastDecision, elifDecNode, 'Sai', 'branch_right');

        let elifTrueLast = elifDecNode;
        eb.body.forEach((s, idx) => {
          const nType = (s.text.includes('input(') || s.text.startsWith('print(')) ? 'io' : 'process';
          const n = this.createNode(nType, s.text, s.lineNum, s.text);
          if (idx === 0) this.addEdge(elifDecNode, n, 'Đúng', 'branch_left');
          else this.addEdge(elifTrueLast, n);
          elifTrueLast = n;
        });
        this.addEdge(elifTrueLast, mergeNode, '', 'merge_from_left');
        lastDecision = elifDecNode;
      });

      if (ifStmt.elseBody && ifStmt.elseBody.length > 0) {
        let elseLast = lastDecision;
        ifStmt.elseBody.forEach((s, idx) => {
          const nType = (s.text.includes('input(') || s.text.startsWith('print(')) ? 'io' : 'process';
          const n = this.createNode(nType, s.text, s.lineNum, s.text);
          if (idx === 0) this.addEdge(lastDecision, n, 'Sai', 'branch_right');
          else this.addEdge(elseLast, n);
          elseLast = n;
        });
        this.addEdge(elseLast, mergeNode, '', 'merge_from_right');
      } else {
        this.addEdge(lastDecision, mergeNode, 'Sai', 'merge_from_right');
      }

    } else if (ifStmt.elseBody && ifStmt.elseBody.length > 0) {
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

  buildWhileCFG(whileStmt, entryNode) {
    const loopEntryMerge = this.createNode('merge', '', whileStmt.lineNum);
    this.addEdge(entryNode, loopEntryMerge);

    const decNode = this.createNode('decision', `${whileStmt.condition}?`, whileStmt.lineNum, whileStmt.condition);
    this.addEdge(loopEntryMerge, decNode);

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

    this.addEdge(bodyExit, loopEntryMerge, '', 'loop_back_left');

    const loopExitMerge = this.createNode('merge', '', whileStmt.lineNum);
    this.addEdge(decNode, loopExitMerge, 'Sai', 'loop_exit_right');

    return loopExitMerge;
  }

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

  calculateLayoutPositions(startNode, endNode) {
    const startX = 320;
    const gapY = 80;
    const branchX = 180;

    let curY = 50;

    this.nodes.forEach(node => {
      if (node.type !== 'end') {
        node.x = startX;
        node.y = curY;
        curY += gapY;
      }
    });

    this.edges.forEach(edge => {
      if (edge.type === 'branch_left') {
        edge.toNode.x = edge.fromNode.x - branchX;
        edge.toNode.y = edge.fromNode.y + 65;
      } else if (edge.type === 'branch_right') {
        edge.toNode.x = edge.fromNode.x + branchX;
        edge.toNode.y = edge.fromNode.y + 65;
      } else if (edge.type === 'loop_exit_right') {
        edge.toNode.x = edge.fromNode.x;
        edge.toNode.y = edge.fromNode.y + 170;
      }
    });

    let maxY = 0;
    this.nodes.forEach(n => {
      if (n.type !== 'end' && n.y > maxY) {
        maxY = n.y;
      }
    });

    endNode.x = startX;
    endNode.y = maxY + 90;
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

    edges.forEach(edge => this.renderEdge(edge));
    nodes.forEach(node => this.renderNode(node));

    let maxX = 640, maxY = 800;
    nodes.forEach(n => {
      if (n.x + 220 > maxX) maxX = n.x + 220;
      if (n.y + 120 > maxY) maxY = n.y + 120;
    });
    this.svg.setAttribute('viewBox', `0 0 ${maxX} ${maxY}`);
  }

  renderNode(node) {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', 'fc-node');
    g.setAttribute('id', `svg_${node.id}`);
    g.setAttribute('data-node-id', node.id);

    let shape;
    const w = node.w, h = node.h;
    const x = node.x - w / 2, y = node.y - h / 2;

    if (node.type === 'start' || node.type === 'end') {
      shape = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      shape.setAttribute('x', x);
      shape.setAttribute('y', y);
      shape.setAttribute('width', w);
      shape.setAttribute('height', h);
      shape.setAttribute('rx', h / 2);
      shape.setAttribute('ry', h / 2);
      shape.setAttribute('fill', node.type === 'start' ? '#065f46' : '#881337');
      shape.setAttribute('stroke', node.type === 'start' ? '#34d399' : '#f43f5e');
      shape.setAttribute('stroke-width', '2.5');
      shape.setAttribute('filter', 'url(#nodeShadow)');

    } else if (node.type === 'io') {
      shape = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      const skew = 14;
      const points = `${x + skew},${y} ${x + w},${y} ${x + w - skew},${y + h} ${x},${y + h}`;
      shape.setAttribute('points', points);
      shape.setAttribute('fill', '#1e3a8a');
      shape.setAttribute('stroke', '#60a5fa');
      shape.setAttribute('stroke-width', '2.5');
      shape.setAttribute('filter', 'url(#nodeShadow)');

    } else if (node.type === 'decision') {
      shape = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      const cx = node.x, cy = node.y;
      const points = `${cx},${cy - h/2} ${cx + w/2},${cy} ${cx},${cy + h/2} ${cx - w/2},${cy}`;
      shape.setAttribute('points', points);
      shape.setAttribute('fill', '#312e81');
      shape.setAttribute('stroke', '#818cf8');
      shape.setAttribute('stroke-width', '2.5');
      shape.setAttribute('filter', 'url(#nodeShadow)');

    } else if (node.type === 'merge') {
      shape = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      shape.setAttribute('cx', node.x);
      shape.setAttribute('cy', node.y);
      shape.setAttribute('r', '6');
      shape.setAttribute('fill', '#38bdf8');
      shape.setAttribute('stroke', '#0284c7');
      shape.setAttribute('stroke-width', '2');

    } else {
      shape = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      shape.setAttribute('x', x);
      shape.setAttribute('y', y);
      shape.setAttribute('width', w);
      shape.setAttribute('height', h);
      shape.setAttribute('rx', '6');
      shape.setAttribute('fill', '#1e293b');
      shape.setAttribute('stroke', '#94a3b8');
      shape.setAttribute('stroke-width', '2.5');
      shape.setAttribute('filter', 'url(#nodeShadow)');
    }

    g.appendChild(shape);

    if (node.type !== 'merge') {
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', node.x);
      text.setAttribute('y', node.y + 4);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('fill', '#f8fafc');
      text.setAttribute('font-size', '11px');
      text.setAttribute('font-weight', '500');
      text.setAttribute('font-family', 'JetBrains Mono, monospace');

      let labelText = node.label;
      if (labelText.length > 20) labelText = labelText.substring(0, 18) + '..';
      text.textContent = labelText;

      g.appendChild(text);
    }

    this.nodesGroup.appendChild(g);
  }

  renderEdge(edge) {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('id', edge.id);
    path.setAttribute('class', 'fc-edge');
    path.setAttribute('marker-end', 'url(#arrowhead)');

    const fn = edge.fromNode, tn = edge.toNode;
    let d = '';

    if (edge.type === 'branch_left') {
      d = `M ${fn.x - fn.w/2} ${fn.y} L ${tn.x} ${fn.y} L ${tn.x} ${tn.y - tn.h/2}`;
      this.renderTextLabel((fn.x - fn.w/2 + tn.x)/2, fn.y - 8, edge.label || 'Đúng', '#34d399');

    } else if (edge.type === 'branch_right') {
      d = `M ${fn.x + fn.w/2} ${fn.y} L ${tn.x} ${fn.y} L ${tn.x} ${tn.y - tn.h/2}`;
      this.renderTextLabel((fn.x + fn.w/2 + tn.x)/2, fn.y - 8, edge.label || 'Sai', '#f43f5e');

    } else if (edge.type === 'merge_from_left' || edge.type === 'merge_from_right') {
      d = `M ${fn.x} ${fn.y + fn.h/2} L ${fn.x} ${tn.y} L ${tn.x} ${tn.y}`;

    } else if (edge.type === 'loop_back_left') {
      const loopX = fn.x - 130;
      d = `M ${fn.x - fn.w/2} ${fn.y} L ${loopX} ${fn.y} L ${loopX} ${tn.y} L ${tn.x - 8} ${tn.y}`;

    } else if (edge.type === 'loop_exit_right') {
      const exitX = fn.x + 140;
      d = `M ${fn.x + fn.w/2} ${fn.y} L ${exitX} ${fn.y} L ${exitX} ${tn.y} L ${tn.x} ${tn.y}`;
      this.renderTextLabel((fn.x + fn.w/2 + exitX)/2, fn.y - 8, 'Sai', '#f43f5e');

    } else {
      d = `M ${fn.x} ${fn.y + fn.h/2} L ${tn.x} ${tn.y - tn.h/2}`;
      if (edge.label) {
        this.renderTextLabel(fn.x + 14, (fn.y + tn.y)/2, edge.label, '#34d399');
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
 * 5. PYTHON INTERPRETER & EXECUTION TRACE GENERATOR
 * ========================================================================= */
class PythonInterpreter {
  constructor() {
    this.variables = {};
    this.output = [];
    this.steps = [];
  }

  evalExpr(expr, scope) {
    try {
      let jsExpr = expr
        .replace(/\band\b/g, '&&')
        .replace(/\bor\b/g, '||')
        .replace(/\bnot\b/g, '!')
        .replace(/True/g, 'true')
        .replace(/False/g, 'false');

      const keys = Object.keys(scope);
      const vals = Object.values(scope);
      const func = new Function(...keys, `return (${jsExpr});`);
      return func(...vals);
    } catch (err) {
      console.warn('Expr Eval Warning:', expr, err);
      return 0;
    }
  }

  async generateTrace(ast, nodes, edges, inputProvider) {
    this.variables = {};
    this.output = [];
    this.steps = [];

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

    addStep(nodes[0], 0, 'Bắt đầu khởi chạy chương trình Python.', 'start');

    const executeBlock = async (stmts) => {
      for (const stmt of stmts) {
        if (stmt.type === 'simple') {
          const text = stmt.text;
          const node = findNode(stmt.lineNum);

          if (text.includes('input(')) {
            const varName = text.split('=')[0].trim();
            let promptMsg = `Nhập giá trị cho ${varName}`;
            const promptMatch = text.match(/input\((.*?)\)/);
            if (promptMatch && promptMatch[1]) {
              promptMsg = promptMatch[1].replace(/['"]/g, '');
            }

            const valStr = await inputProvider(promptMsg, varName);
            let val = valStr;
            if (text.includes('int(')) val = parseInt(valStr, 10) || 0;
            else if (text.includes('float(')) val = parseFloat(valStr) || 0;

            this.variables[varName] = val;
            addStep(node, stmt.lineNum, `Nhập dữ liệu từ bàn phím: Đã gán biến <b>${varName} = ${val}</b>`);

          } else if (text.startsWith('print(')) {
            const content = text.substring(6, text.length - 1);
            const args = content.split(',').map(a => a.trim());
            const printedValues = args.map(arg => {
              if ((arg.startsWith('"') && arg.endsWith('"')) || (arg.startsWith("'") && arg.endsWith("'"))) {
                return arg.slice(1, -1);
              }
              return this.evalExpr(arg, this.variables);
            });

            const outStr = printedValues.join(' ');
            this.output.push(outStr);
            addStep(node, stmt.lineNum, `Xuất ra màn hình Terminal: <b class="text-emerald-400">"${outStr}"</b>`);

          } else if (text.includes('=')) {
            const parts = text.split('=');
            const varName = parts[0].trim();
            const expr = parts[1].trim();
            const result = this.evalExpr(expr, this.variables);
            this.variables[varName] = result;
            addStep(node, stmt.lineNum, `Tính toán & gán giá trị: <b>${varName} = ${result}</b>`);
          }

        } else if (stmt.type === 'if') {
          const node = findNode(stmt.lineNum, 'decision');
          const condVal = !!this.evalExpr(stmt.condition, this.variables);

          addStep(node, stmt.lineNum, `Kiểm tra điều kiện Rẽ Nhánh: <b>[ ${stmt.condition} ]</b> ➔ Kết quả: <b class="${condVal ? 'text-emerald-400' : 'text-rose-400'}">${condVal ? 'ĐÚNG (True)' : 'SAI (False)'}</b>`);

          if (condVal) {
            await executeBlock(stmt.thenBody);
          } else {
            let executedElif = false;
            if (stmt.elifBlocks) {
              for (const eb of stmt.elifBlocks) {
                const elifNode = findNode(eb.lineNum, 'decision');
                const elifVal = !!this.evalExpr(eb.cond, this.variables);
                addStep(elifNode, eb.lineNum, `Kiểm tra điều kiện Elif: <b>[ ${eb.cond} ]</b> ➔ Kết quả: <b class="${elifVal ? 'text-emerald-400' : 'text-rose-400'}">${elifVal ? 'ĐÚNG (True)' : 'SAI (False)'}</b>`);
                if (elifVal) {
                  await executeBlock(eb.body);
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

          while (loopCount < 200) {
            const condVal = !!this.evalExpr(stmt.condition, this.variables);
            addStep(decNode, stmt.lineNum, `Kiểm tra điều kiện Vòng Lặp While: <b>[ ${stmt.condition} ]</b> ➔ Kết quả: <b class="${condVal ? 'text-emerald-400' : 'text-rose-400'}">${condVal ? 'ĐÚNG (Tiếp tục lặp)' : 'SAI (Thoát vòng lặp)'}</b>`);

            if (!condVal) break;
            await executeBlock(stmt.body);
            loopCount++;
          }

        } else if (stmt.type === 'for') {
          const decNode = findNode(stmt.lineNum, 'decision');

          let start = 0, end = 0, step = 1;
          const rangeMatch = stmt.rangeExpr.match(/range\((.*?)\)/);
          if (rangeMatch) {
            const args = rangeMatch[1].split(',').map(a => this.evalExpr(a.trim(), this.variables));
            if (args.length === 1) end = args[0];
            else if (args.length === 2) { start = args[0]; end = args[1]; }
            else if (args.length === 3) { start = args[0]; end = args[1]; step = args[2]; }
          }

          for (let i = start; step > 0 ? i < end : i > end; i += step) {
            this.variables[stmt.varName] = i;
            addStep(decNode, stmt.lineNum, `Vòng lặp For: Cập nhật <b>${stmt.varName} = ${i}</b> (${i} < ${end}) ➔ <b>ĐÚNG</b>`);
            await executeBlock(stmt.body);
          }

          addStep(decNode, stmt.lineNum, `Vòng lặp For kết thúc. Biến ${stmt.varName} đã hoàn tất.`);
        }
      }
    };

    await executeBlock(ast);

    const endNode = nodes.find(n => n.type === 'end');
    addStep(endNode, 9999, 'Chương trình đã thực thi hoàn tất! Luồng điều khiển kết thúc tại khối KẾT THÚC.', 'end');

    return this.steps;
  }
}

/* =========================================================================
 * 6. APPLICATION CONTROLLER & INTERACTIVE UI BINDINGS
 * ========================================================================= */
document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
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

  const pasteFallbackCode = document.getElementById('pasteFallbackCode');
  const btnSyncPastedCode = document.getElementById('btnSyncPastedCode');

  const flowchartSvg = document.getElementById('flowchartSvg');
  const svgViewport = document.getElementById('svgViewport');

  const btnZoomIn = document.getElementById('btnZoomIn');
  const btnZoomOut = document.getElementById('btnZoomOut');
  const btnResetZoom = document.getElementById('btnResetZoom');
  const btnExportSVG = document.getElementById('btnExportSVG');

  const inputModal = document.getElementById('inputModal');
  const inputModalPrompt = document.getElementById('inputModalPrompt');
  const modalInputValue = document.getElementById('modalInputValue');
  const btnSubmitInput = document.getElementById('btnSubmitInput');

  const tabBtnEditor = document.getElementById('tabBtnEditor');
  const tabBtnOnlinePython = document.getElementById('tabBtnOnlinePython');
  const tabContentEditor = document.getElementById('tabContentEditor');
  const tabContentOnlinePython = document.getElementById('tabContentOnlinePython');

  const btnFullscreenIframe = document.getElementById('btnFullscreenIframe');
  const btnFullscreenFlow = document.getElementById('btnFullscreenFlow');
  const btnFloatingSim = document.getElementById('btnFloatingSim');
  const onlinePythonIframe = document.getElementById('onlinePythonIframe');
  const flowchartPanel = document.getElementById('flowchartPanel');

  // Engine Instances
  const layoutEngine = new FlowchartLayoutEngine();
  const svgRenderer = new SVGFlowchartRenderer(flowchartSvg, svgViewport);
  const interpreter = new PythonInterpreter();

  // State Variables
  let currentAST = null;
  let currentGraph = null;
  let traceSteps = [];
  let currentStepIdx = -1;
  let autoPlayInterval = null;
  let zoomLevel = 1.0;
  let pendingInputResolver = null;

  // Input Caching System State Variables
  let savedInputs = [];        // Lưu mảng các giá trị người dùng đã nhập
  let inputIndex = 0;           // Trỏ vị trí lấy dữ liệu cũ khi tái sử dụng
  let isReusingInputs = false;  // Cờ đánh dấu có dùng dữ liệu cũ hay không

  // Initial Preset Setup
  codeInput.value = CODE_PRESETS.preset_if;
  updateLineNumbers();

  function updateLineNumbers() {
    const lines = codeInput.value.split('\n').length;
    lineNumbers.innerHTML = Array.from({ length: lines }, (_, i) => i + 1).join('<br>');
  }

  codeInput.addEventListener('input', () => {
    updateLineNumbers();
    savedInputs = []; // Xóa bộ nhớ tạm khi mã nguồn thay đổi
    resetSimulation();
  });

  presetSelect.addEventListener('change', (e) => {
    if (CODE_PRESETS[e.target.value]) {
      codeInput.value = CODE_PRESETS[e.target.value];
      updateLineNumbers();
      savedInputs = []; // Xóa bộ nhớ tạm khi chọn bài mẫu mới
      buildAndRenderFlowchart();
    }
  });

  btnSyncPastedCode.addEventListener('click', () => {
    if (pasteFallbackCode.value.trim().length > 0) {
      codeInput.value = pasteFallbackCode.value.trim();
      updateLineNumbers();
      savedInputs = [];
      tabBtnEditor.click();
      buildAndRenderFlowchart();
    }
  });

  // Tab Switchers
  tabBtnEditor.addEventListener('click', () => {
    tabBtnEditor.classList.add('border-blue-500', 'text-blue-400', 'font-semibold', 'bg-slate-900/40');
    tabBtnEditor.classList.remove('border-transparent');
    tabBtnOnlinePython.classList.remove('border-blue-500', 'text-blue-400', 'font-semibold', 'bg-slate-900/40');
    tabBtnOnlinePython.classList.add('border-transparent');
    tabContentEditor.classList.remove('hidden');
    tabContentOnlinePython.classList.add('hidden');
    tabContentEditor.classList.add('flex');
  });

  tabBtnOnlinePython.addEventListener('click', () => {
    tabBtnOnlinePython.classList.add('border-blue-500', 'text-blue-400', 'font-semibold', 'bg-slate-900/40');
    tabBtnOnlinePython.classList.remove('border-transparent');
    tabBtnEditor.classList.remove('border-blue-500', 'text-blue-400', 'font-semibold', 'bg-slate-900/40');
    tabBtnEditor.classList.add('border-transparent');
    tabContentOnlinePython.classList.remove('hidden');
    tabContentEditor.classList.add('hidden');
    tabContentOnlinePython.classList.add('flex');
  });

  /* Flowchart Builder */
  function buildAndRenderFlowchart() {
    resetSimulation();
    try {
      currentAST = PythonASTBuilder.parse(codeInput.value);
      currentGraph = layoutEngine.buildCFG(currentAST);
      svgRenderer.render(currentGraph.nodes, currentGraph.edges);
      terminalOutput.textContent = '> Lưu đồ đã tạo thành công. Khối KẾT THÚC nằm ở dưới cùng.';
    } catch (err) {
      console.error('Syntax/Parsing error:', err);
      terminalOutput.textContent = '> Lỗi cú pháp mã nguồn: ' + err.message;
    }
  }

  btnBuildFlow.addEventListener('click', () => {
    savedInputs = [];
    buildAndRenderFlowchart();
  });

  /* Interactive Input Helper với cơ chế Caching */
  function requestUserInput(promptMsg, varName) {
    // NẾU ĐANG CHẠY LẠI VÀ CÓ DỮ LIỆU CŨ -> TỰ ĐỘNG DÙNG LẠI
    if (isReusingInputs && inputIndex < savedInputs.length) {
      const val = savedInputs[inputIndex++];
      return Promise.resolve(val);
    }

    // NẾU CHƯA CÓ DỮ LIỆU CŨ -> BẬT POPUP HỎI VÀ LƯU VÀO BỘ NHỚ
    return new Promise((resolve) => {
      pendingInputResolver = (val) => {
        savedInputs.push(val); // Lưu lại dữ liệu cho các lần chạy sau
        resolve(val);
      };
      inputModalPrompt.innerHTML = `${promptMsg} <br><span class="text-cyan-400">(Biến: <b>${varName}</b>)</span>:`;
      modalInputValue.value = '5';
      inputModal.classList.remove('hidden');
      modalInputValue.focus();
    });
  }

  btnSubmitInput.addEventListener('click', () => {
    if (pendingInputResolver) {
      const val = modalInputValue.value;
      inputModal.classList.add('hidden');
      const resolver = pendingInputResolver;
      pendingInputResolver = null;
      resolver(val);
    }
  });

  modalInputValue.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') btnSubmitInput.click();
  });

  /* Hàm Khởi chạy Mô phỏng */
  async function startSimulation(reuseOldInputs = false) {
    if (!currentGraph) buildAndRenderFlowchart();

    stopAutoPlay();

    // Thiết lập trạng thái sử dụng dữ liệu cũ
    if (reuseOldInputs && savedInputs.length > 0) {
      isReusingInputs = true;
      inputIndex = 0;
    } else {
      isReusingInputs = false;
      savedInputs = []; // Xóa bộ nhớ cũ nếu đây là lần mô phỏng hoàn toàn mới
      inputIndex = 0;
    }

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
      
      startAutoPlay();

    } catch (err) {
      console.error('Execution error:', err);
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
      startSimulation(false); // Bắt đầu mô phỏng mới (hỏi lại dữ liệu)
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

    stepCounterText.textContent = 'Trạng thái: Sẵn sàng mô phỏng';
    stepPercentage.textContent = 'Bước 0/0';
    stepExplanation.innerHTML = '<p class="text-slate-500 italic">Nhấn nút <b>[▶ Mô phỏng]</b> để bắt đầu theo dõi luồng thực thi.</p>';
    variablesTableBody.innerHTML = '<tr><td colspan="2" class="text-slate-600 text-[11px] py-2 italic">Chưa có biến nào</td></tr>';
    terminalOutput.textContent = '> Hệ thống đã sẵn sàng.';

    document.querySelectorAll('.fc-node').forEach(el => {
      el.classList.remove('active', 'active-end');
    });
    document.querySelectorAll('.fc-edge').forEach(el => el.classList.remove('active'));
    codeHighlights.innerHTML = '';
  }

  /* Step Renderer */
  function renderStep(idx) {
    if (idx < 0 || idx >= traceSteps.length) return;

    const step = traceSteps[idx];

    stepCounterText.textContent = `Trạng thái: Đang thực thi bước ${step.stepIndex}`;
    stepPercentage.textContent = `Bước ${step.stepIndex}/${traceSteps.length}`;

    btnStepPrev.disabled = (idx === 0);
    btnStepNext.disabled = (idx === traceSteps.length - 1);

    highlightCodeLine(step.lineNum);
    highlightSvgNode(step.nodeId, step.actionType === 'end');

    stepExplanation.innerHTML = `
      <div class="flex items-start gap-2">
        <span class="px-1.5 py-0.5 bg-blue-500/20 text-blue-400 font-mono text-[10px] rounded font-bold shrink-0">Dòng ${step.lineNum > 9000 ? 'END' : step.lineNum}</span>
        <p class="text-xs text-slate-100 leading-relaxed">${step.explanation}</p>
      </div>
    `;

    renderVariablesTable(step.variables);

    if (step.outputSnapshot.length > 0) {
      terminalOutput.textContent = step.outputSnapshot.map(o => `> ${o}`).join('\n');
    } else {
      terminalOutput.textContent = '> Chương trình đang thực thi...';
    }
  }

  function highlightCodeLine(lineNum) {
    codeHighlights.innerHTML = '';
    if (!lineNum || lineNum <= 0 || lineNum > 9000) return;

    const lineDiv = document.createElement('div');
    lineDiv.style.top = `${(lineNum - 1) * 24}px`;
    lineDiv.style.height = '24px';
    lineDiv.className = 'absolute w-full line-active pointer-events-none';
    codeHighlights.appendChild(lineDiv);
  }

  function highlightSvgNode(nodeId, isEndStep = false) {
    document.querySelectorAll('.fc-node').forEach(el => el.classList.remove('active', 'active-end'));
    document.querySelectorAll('.fc-edge').forEach(el => el.classList.remove('active'));

    if (!nodeId) return;

    const targetNodeGroup = document.getElementById(`svg_${nodeId}`);
    if (targetNodeGroup) {
      if (isEndStep) {
        targetNodeGroup.classList.add('active-end');
      } else {
        targetNodeGroup.classList.add('active');
      }

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
      variablesTableBody.innerHTML = '<tr><td colspan="2" class="text-slate-600 text-[11px] py-2 italic">Chưa có biến nào</td></tr>';
      return;
    }

    variablesTableBody.innerHTML = keys.map(k => `
      <tr class="border-b border-slate-800/60">
        <td class="py-1 font-semibold text-amber-300">${k}</td>
        <td class="py-1 text-slate-100">${vars[k]}</td>
      </tr>
    `).join('');
  }

  btnClearTerminal.addEventListener('click', () => {
    terminalOutput.textContent = '> Terminal cleared.';
  });

  // Zoom Controls
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

  // Download SVG Image
  btnExportSVG.addEventListener('click', () => {
    const svgData = flowchartSvg.outerHTML;
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    const downloadLink = document.createElement('a');
    downloadLink.href = svgUrl;
    downloadLink.download = 'flowchart_python.svg';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  });

  // Fullscreen Online Python IDE
  if (btnFullscreenIframe && onlinePythonIframe) {
    btnFullscreenIframe.addEventListener('click', () => {
      if (onlinePythonIframe.requestFullscreen) {
        onlinePythonIframe.requestFullscreen();
      } else if (onlinePythonIframe.webkitRequestFullscreen) {
        onlinePythonIframe.webkitRequestFullscreen();
      }
    });
  }

  // Fullscreen Flowchart Panel
  if (btnFullscreenFlow && flowchartPanel) {
    btnFullscreenFlow.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        if (flowchartPanel.requestFullscreen) {
          flowchartPanel.requestFullscreen();
        } else if (flowchartPanel.webkitRequestFullscreen) {
          flowchartPanel.webkitRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
    });
  }

  /* SỰ KIỆN NÚT NỔI "CHẠY LẠI (DỮ LIỆU CŨ)" */
  if (btnFloatingSim) {
    btnFloatingSim.addEventListener('click', () => {
      if (savedInputs.length > 0) {
        // Đã có dữ liệu nhập trước đó -> Chạy lại trực tiếp bằng dữ liệu cũ
        startSimulation(true);
      } else {
        // Chưa có dữ liệu -> Chạy mô phỏng mới và hỏi dữ liệu nhập
        startSimulation(false);
      }
    });
  }

  // Initial Build on Load
  buildAndRenderFlowchart();
});