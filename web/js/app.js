// UI Controller, State Coordinator, and Diagnostics Engine for YaarLang Workbench
document.addEventListener('DOMContentLoaded', () => {
    const editor = document.getElementById('code-editor');
    const lineNumbers = document.getElementById('line-numbers');
    const sampleSelect = document.getElementById('sample-select');
    const btnRun = document.getElementById('btn-run');
    const btnReset = document.getElementById('btn-reset');
    const btnCopyCode = document.getElementById('btn-copy-code');
    const btnCopyOutput = document.getElementById('btn-copy-output');
    const deckContent = document.getElementById('deck-content');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const editorStats = document.getElementById('editor-stats');
    const compilationStatus = document.getElementById('compilation-status');
    const diagnosticTip = document.getElementById('diagnostic-tip');
    const matrixSearch = document.getElementById('matrix-search');
    const syntaxTable = document.getElementById('syntax-table');
    const toast = document.getElementById('toast');

    const runtime = new YaarLangRuntime();
    let currentCompilation = null;
    let activeTab = 'terminal';

    // -------------------------------------------------------------------------
    // 1. Toast Notification Helper
    // -------------------------------------------------------------------------
    let toastTimeout = null;
    function showToast(message) {
        if (!toast) return;
        toast.textContent = message;
        toast.classList.add('show');
        if (toastTimeout) clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            toast.classList.remove('show');
        }, 2200);
    }

    // -------------------------------------------------------------------------
    // 2. Line Numbers & Cursor Position Tracker
    // -------------------------------------------------------------------------
    function updateLineNumbers() {
        const text = editor.value;
        const lines = text.split('\n').length;
        lineNumbers.innerHTML = Array.from({ length: lines }, (_, i) => i + 1).join('<br>');
        updateCursorStats();
    }

    function updateCursorStats() {
        const pos = editor.selectionStart;
        const text = editor.value.substring(0, pos);
        const lines = text.split('\n');
        const lineNum = lines.length;
        const colNum = lines[lines.length - 1].length + 1;
        if (editorStats) {
            editorStats.textContent = `Line ${lineNum}, Col ${colNum} • ${editor.value.length} chars`;
        }
    }

    editor.addEventListener('input', updateLineNumbers);
    editor.addEventListener('keyup', updateCursorStats);
    editor.addEventListener('click', updateCursorStats);

    editor.addEventListener('scroll', () => {
        lineNumbers.scrollTop = editor.scrollTop;
    });

    // -------------------------------------------------------------------------
    // 3. Tab Key Support & Keyboard Shortcuts in Editor
    // -------------------------------------------------------------------------
    editor.addEventListener('keydown', (e) => {
        // Tab indentation (4 spaces)
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = editor.selectionStart;
            const end = editor.selectionEnd;
            const indent = '    ';
            editor.value = editor.value.substring(0, start) + indent + editor.value.substring(end);
            editor.selectionStart = editor.selectionEnd = start + indent.length;
            updateLineNumbers();
            return;
        }

        // Ctrl+Enter or Cmd+Enter to Run
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            executeCode();
        }
    });

    // -------------------------------------------------------------------------
    // 4. Sample Loader
    // -------------------------------------------------------------------------
    function loadSample(key) {
        if (typeof SAMPLES !== 'undefined' && SAMPLES[key]) {
            editor.value = SAMPLES[key];
            updateLineNumbers();
            executeCode();
        }
    }

    sampleSelect.addEventListener('change', (e) => {
        loadSample(e.target.value);
    });

    btnReset.addEventListener('click', () => {
        loadSample(sampleSelect.value);
        showToast("Code reset to original preset sample.");
    });

    // -------------------------------------------------------------------------
    // 5. Copy Actions
    // -------------------------------------------------------------------------
    btnCopyCode.addEventListener('click', () => {
        navigator.clipboard.writeText(editor.value).then(() => {
            showToast("Source code copied to clipboard!");
        }).catch(() => {
            showToast("Failed to copy source code.");
        });
    });

    btnCopyOutput.addEventListener('click', () => {
        navigator.clipboard.writeText(deckContent.textContent).then(() => {
            showToast("Diagnostics output copied to clipboard!");
        }).catch(() => {
            showToast("Failed to copy diagnostics.");
        });
    });

    // -------------------------------------------------------------------------
    // 6. Diagnostics Deck Tabs
    // -------------------------------------------------------------------------
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            tabButtons.forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-selected', 'false');
            });
            btn.classList.add('active');
            btn.setAttribute('aria-selected', 'true');
            activeTab = btn.getAttribute('data-tab');
            renderDeckContent();
        });
    });

    function renderDeckContent() {
        if (!currentCompilation) {
            deckContent.textContent = "Click 'Chalao (Run)' or press Ctrl+Enter to compile and execute.";
            return;
        }

        if (!currentCompilation.success) {
            deckContent.innerHTML = `<span style="color: var(--accent-rose);">${escapeHTML(currentCompilation.error)}</span>`;
            if (compilationStatus) {
                compilationStatus.className = "status-badge error";
                compilationStatus.innerHTML = '<span class="badge-dot-sm"></span> Compilation Failed';
            }
            if (diagnosticTip) {
                diagnosticTip.textContent = "Check syntax boundaries: sun yaar { ... } khatam yaar";
            }
            return;
        }

        if (compilationStatus) {
            compilationStatus.className = "status-badge success";
            compilationStatus.innerHTML = '<span class="badge-dot-sm"></span> Compilation OK';
        }

        switch (activeTab) {
            case 'terminal':
                deckContent.textContent = currentCompilation.output || "[Program executed cleanly with no output]";
                if (diagnosticTip) diagnosticTip.textContent = "Terminal VM Standard Output";
                break;
            case 'ast':
                deckContent.textContent = currentCompilation.ast || "[AST Empty]";
                if (diagnosticTip) diagnosticTip.textContent = "Hierarchical Abstract Syntax Tree";
                break;
            case 'tac':
                deckContent.textContent = currentCompilation.tac || "[TAC Quadruples Empty]";
                if (diagnosticTip) diagnosticTip.textContent = "Linear IR Quadruples (Op, Arg1, Arg2, Res)";
                break;
            case 'mips':
                deckContent.textContent = currentCompilation.mips || "[MIPS32 Assembly Empty]";
                if (diagnosticTip) diagnosticTip.textContent = "Target MIPS32 Assembly Listing";
                break;
            case 'opt':
                deckContent.textContent = currentCompilation.opt || "[Optimization Stats Empty]";
                if (diagnosticTip) diagnosticTip.textContent = "Basic Block & Constant Folding Report";
                break;
        }
    }

    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag));
    }

    // -------------------------------------------------------------------------
    // 7. Compilation & Execution Pipeline
    // -------------------------------------------------------------------------
    function executeCode() {
        const code = editor.value;
        const startTime = performance.now();
        currentCompilation = runtime.compileAndRun(code);
        const duration = Math.round(performance.now() - startTime);

        renderDeckContent();

        if (currentCompilation.success) {
            if (diagnosticTip) {
                diagnosticTip.textContent = `Completed in ${duration}ms • In-Memory VM`;
            }
        }
    }

    btnRun.addEventListener('click', executeCode);

    // -------------------------------------------------------------------------
    // 8. Language Matrix Live Search Filter
    // -------------------------------------------------------------------------
    if (matrixSearch && syntaxTable) {
        matrixSearch.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            const rows = syntaxTable.querySelectorAll('tbody tr');

            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                if (!query || text.includes(query)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    }

    // -------------------------------------------------------------------------
    // 9. Initial Load
    // -------------------------------------------------------------------------
    loadSample('fibonacci');
});
