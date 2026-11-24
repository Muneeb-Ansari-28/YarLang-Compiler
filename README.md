# YaarLang Compiler (`yaarc`)

> **Course:** CS 4031 — Compiler Construction  
> **Institution:** FAST-NUCES (Faisalabad-Chiniot Campus)  
> **Evaluation:** 30% Implementation Deliverables | 70% Individual Viva  
> **Repository:** [https://github.com/Muneeb-Ansari-28/YarLang-Compiler](https://github.com/Muneeb-Ansari-28/YarLang-Compiler)

---

## 🌟 Overview

**`YaarLang`** is a complete, multi-stage educational compiler written in standard C++17 with Flex and Bison. Inspired by Bhailang, it brings authentic Pakistani student slang (`sun yaar`, `khatam yaar`, `bol yaar`, `dekh yaar`, `sardi`, `garmi`, `jugaad`, `pakka`, `topi`) into a strongly typed, block-scoped C-family language.

### 🌐 Interactive Web Workbench & Playground
A minimalist, animated single-page web app with a Three.js 3D background is available in [`web/index.html`](web/index.html). It runs pure client-side in any browser with zero setup, allowing live in-browser execution, AST inspection, TAC quadruples, optimization metrics, and MIPS32 assembly viewing.

### Supported Language Features (All 11 Mandatory Constructs)
1. **Data Types:** `number` (32-bit int), `float` (64-bit float), `char`, `string`, `bool` (`pakka` / `topi`)
2. **Variables:** Declaration (`rakh yaar`), initialization, and assignment
3. **Arithmetic Operators:** `+`, `-`, `*`, `/`, `%`
4. **Relational Operators:** `>`, `<`, `>=`, `<=`, `==`, `!=`
5. **Logical Operators:** `&&`, `||`, `!`
6. **Conditionals:** `agar yaar (...) { } warna agar (...) { } warna { }`
7. **Selection:** `dekh yaar (...) { sardi <val>: ... bas kar yaar; garmi: ... }`
8. **Loops:** `ghoom yaar` (for), `jab tak yaar` (while), `chala yaar ... jab tak yaar` (do-while)
9. **Functions:** `jugaad <type> <name>(...) { ... de yaar <val>; }`
10. **Arrays:** `list yaar <type> <name>[<size>];`
11. **Input / Output:** `bol yaar(...)` (print) and `puch yaar(...)` (input)

---

## 🚀 Quick Start (Kali Linux / Ubuntu)

### 1. Install Dependencies
```bash
sudo apt update
sudo apt install -y build-essential flex bison make
```

### 2. Build the Compiler
```bash
make clean && make
```

### 3. Run a Program in the VM
```bash
./bin/yaarc --run tests/valid/07_fibonacci.yaar
```

### 4. Run the Full Automated Test Suite
```bash
make test
```

---

## 🛠️ CLI Options & Diagnostics

The compiled binary `bin/yaarc` supports rich inspection flags for viva defense:

| Flag | Description |
| :--- | :--- |
| *(none)* | Full compilation and Three-Address Code (TAC) generation |
| `--ast` | Print visual Abstract Syntax Tree (AST) |
| `--symbols` | Dump Scoped Symbol Tables for all scope levels |
| `--tac` | Display generated Three-Address Code Quadruples |
| `--cfg` | Print Basic Blocks and Graphviz DOT graph |
| `--opt` | Run Optimization passes & display % reduction metrics |
| `--mips` | Generate standard MIPS32 Target Assembly code |
| `--run` | Interactively execute the program in the terminal via VM runtime |
| `--all` | Run complete pipeline displaying all stages |

---

## 📁 Project Structure

```
├── docs/
│   ├── language_spec.md            # Formal Language Specification
│   └── grammar_bnf.md              # Formal BNF Context-Free Grammar (CFG)
│
├── src/
│   ├── main.cpp                    # Compiler CLI driver
│   ├── frontend/
│   │   ├── lexer.l                 # Flex lexical analyzer specification
│   │   └── parser.y                # Bison LALR(1) parser specification
│   ├── ast/
│   │   ├── ast.h                   # C++ AST class hierarchy
│   │   └── ast.cpp                 # AST printing and memory management
│   ├── semantics/
│   │   ├── symbol_table.h          # Scoped Symbol Table (parent chaining)
│   │   ├── symbol_table.cpp
│   │   ├── semantic_analyzer.h     # Type checking and semantic validation
│   │   └── semantic_analyzer.cpp
│   ├── ir/
│   │   ├── tac.h                   # Three-Address Code Quadruples
│   │   ├── tac_generator.h         # Linear IR code generator
│   │   └── tac_generator.cpp
│   ├── optimizer/
│   │   ├── basic_block.h           # Leader detection & CFG construction
│   │   ├── basic_block.cpp
│   │   ├── optimizer.h             # Constant folding, DCE, copy propagation
│   │   └── optimizer.cpp
│   └── backend/
│       ├── mips_codegen.h          # MIPS32 target assembly emitter
│       ├── mips_codegen.cpp
│       ├── vm_engine.h             # In-memory runtime execution VM
│       └── vm_engine.cpp
│
├── tests/
│   ├── valid/                      # 7 comprehensive test suites
│   └── invalid/                    # 5 negative syntax and semantic test cases
│
├── Makefile                        # Universal Linux build script
└── README.md                       # Project documentation
```

---

## 👥 Authors
* CS 4031 Semester Project Team — FAST-NUCES (Faisalabad-Chiniot Campus)
