const { Plugin, Menu } = require("siyuan");

const styleId = "toolbar-plus";
const docStyleId = 'toolbar-plus-docstyle';

const indentProperty = "custom-tool-plus-indent";
const columnsProperty = "custom-tool-plus-columns";


let styleContent = `
.layout-tab-container > .protyle:has(.protyle-content .protyle-title__input[contenteditable="true"])  > .protyle-toolbar {
    display: flex !important;
    position: absolute !important;
    top: 33px !important;
    padding-left: 6px;
    border-top: 1px solid var(--b3-border-color);
    border-bottom: 1px solid var(--b3-border-color);
    left: 0 !important;
    width: 100%;
    border-radius: 0;
    box-shadow: none;
    transform: none;
}

.protyle-content:has(.protyle-title__input[contenteditable="true"]) {
    margin-top: 33px;
}

html[data-light-theme="Savor"] .layout-tab-container > .protyle:has(.protyle-content .protyle-title__input[contenteditable="true"])  > .protyle-toolbar,
html[data-light-theme="Savor"] .layout-tab-container > .protyle:has(.protyle-content .protyle-title__input[contenteditable="true"])  > .protyle-toolbar {
  top: 45px !important;
  border-radius: 0;
  z-index: 1;
}

html[data-light-theme="Rem Craft"] .layout-tab-container > .protyle:has(.protyle-content .protyle-title__input[contenteditable="true"])  > .protyle-toolbar,
html[data-light-theme="Rem Craft"] .layout-tab-container > .protyle:has(.protyle-content .protyle-title__input[contenteditable="true"])  > .protyle-toolbar {
    top: 40px !important;
    border-radius: 0;
    z-index: 1;
}
`;
let docStyleContent = '';
for (let i = 1; i < 10; i++) {
  docStyleContent += `
    *[${indentProperty}="${i + 1}"] {
        text-indent: ${i + 1}em;
    }
    `;
}
for (let i = 1; i < 10; i++) {
  docStyleContent += `
    *[${columnsProperty}="${i + 1}"] {
      columns: ${i + 1};
    }
  `;
}



const defaultConf = {
  fixToolbar: true,
};

function getBlockAttrs(block) {
  return fetch("/api/attr/getBlockAttrs", {
    method: "POST",
    body: JSON.stringify({
      id: block,
    }),
  })
    .then((res) => res.json())
    .then((data) => data.data);
}

function setBlockAttrs(block, attrs) {
  return fetch("/api/attr/setBlockAttrs", {
    method: "POST",
    body: JSON.stringify({
      id: block,
      attrs,
    }),
  })
    .then((res) => res.json())
    .then((data) => data.data);
}

module.exports = class ToolbarPlusPlugin extends Plugin {
  currentConf = Object.assign({}, defaultConf);

  protyles = new Map();

  toolbars = new Set();

  config = {
    showToolbarOnTop: true,
  }

  async loadStorage() {
    const data = await this.loadData('config.json');
    if (!data) {
      this.saveStorage();
    } else {
      Object.assign(this.config, data);
    }
  }

  async saveStorage() {
    await this.saveData('config.json', this.config);
  }

  onload() {
    // add icons
    this.addIcons(`
    <symbol id="iconColumnsUp" viewBox="0 0 1024 1024"><path d="M402.295467 0H73.1136A73.3184 73.3184 0 0 0 0 73.1136v877.7728c0.136533 40.3456 32.768 72.977067 73.1136 73.1136h329.181867a73.3184 73.3184 0 0 0 73.1136-73.1136V73.1136A73.3184 73.3184 0 0 0 402.295467 0z m0 914.295467a34.542933 34.542933 0 0 1-36.590934 36.590933h-256a34.542933 34.542933 0 0 1-36.590933-36.590933V109.704533a34.542933 34.542933 0 0 1 36.590933-36.590933h256a34.542933 34.542933 0 0 1 36.590934 36.590933v804.590934zM950.8864 0H621.704533a73.3184 73.3184 0 0 0-73.1136 73.1136v877.7728c0.136533 40.3456 32.768 72.977067 73.1136 73.1136h329.181867A73.3184 73.3184 0 0 0 1024 950.8864V73.1136A73.3184 73.3184 0 0 0 950.8864 0z m0 914.295467a34.542933 34.542933 0 0 1-36.590933 36.590933h-256a34.542933 34.542933 0 0 1-36.590934-36.590933V109.704533a34.542933 34.542933 0 0 1 36.590934-36.590933h256a34.542933 34.542933 0 0 1 36.590933 36.590933v804.590934z" p-id="7648"></path></symbol>
    <symbol id="iconColumnsDown" viewBox="0 0 1024 1024"><path d="M406.186667 964.266667H107.52c-25.6 0-47.786667-20.48-47.786667-47.786667V105.813333c0-25.6 20.48-46.08 47.786667-46.08h298.666667c25.6 0 47.786667 20.48 47.786666 46.08v192.853334c0 13.653333-11.946667 25.6-25.6 25.6s-25.6-11.946667-25.6-25.6v-187.733334h-290.133333v802.133334h290.133333v-187.733334c0-13.653333 11.946667-25.6 25.6-25.6s25.6 11.946667 25.6 25.6v192.853334c-1.706667 25.6-22.186667 46.08-47.786666 46.08zM918.186667 964.266667H619.52c-25.6 0-47.786667-20.48-47.786667-47.786667V725.333333c0-13.653333 11.946667-25.6 25.6-25.6s25.6 11.946667 25.6 25.6v187.733334h290.133334v-802.133334h-290.133334v187.733334c0 13.653333-11.946667 25.6-25.6 25.6s-25.6-11.946667-25.6-25.6V105.813333c0-25.6 20.48-46.08 47.786667-46.08h298.666667c25.6 0 47.786667 20.48 47.786666 46.08v810.666667c-1.706667 27.306667-22.186667 47.786667-47.786666 47.786667z" p-id="5195"></path><path d="M938.666667 537.6H597.333333c-13.653333 0-25.6-11.946667-25.6-25.6s11.946667-25.6 25.6-25.6h341.333334c13.653333 0 25.6 11.946667 25.6 25.6s-11.946667 25.6-25.6 25.6zM426.666667 537.6H107.52c-13.653333 0-25.6-11.946667-25.6-25.6s11.946667-25.6 25.6-25.6H426.666667c13.653333 0 25.6 11.946667 25.6 25.6s-11.946667 25.6-25.6 25.6z" p-id="5196"></path><path d="M698.026667 640c-6.826667 0-13.653333-1.706667-18.773334-6.826667l-102.4-102.4c-10.24-10.24-10.24-25.6 0-35.84l102.4-102.4c10.24-10.24 25.6-10.24 35.84 0s10.24 25.6 0 35.84L631.466667 512l85.333333 85.333333c10.24 10.24 10.24 25.6 0 35.84-5.12 5.12-11.946667 6.826667-18.773333 6.826667zM327.68 640c-6.826667 0-13.653333-1.706667-18.773333-6.826667-10.24-10.24-10.24-25.6 0-35.84l83.626666-83.626666-83.626666-83.626667c-10.24-10.24-10.24-25.6 0-35.84s25.6-10.24 35.84 0l102.4 102.4c10.24 10.24 10.24 25.6 0 35.84l-102.4 102.4c-3.413333 3.413333-10.24 5.12-17.066667 5.12z" p-id="5197"></path></symbol>
    `)
    this.createStyle(docStyleId, docStyleContent);
    this.loadStorage().then(() => {
      if (this.config.showToolbarOnTop) {
        this.createStyle(styleId, styleContent);
      }
    })
    watchCurrentPageChange(() => {
      this.injectButton();
    });

    const topBarElement = this.addTopBar({
      icon: "iconRefresh",
      title: this.i18n.title,
      position: "right",
      callback: () => {
        let rect = topBarElement.getBoundingClientRect();
        const menu = new Menu("toolarPlusMenu");
        menu.addItem({
          icon: "iconRefresh",
          label: this.i18n.toggleShowToolbarOnTop,
          click: () => {
            this.toggleShowToolbarOnTop();
          }
        });
        menu.open({
          x: rect.right,
          y: rect.bottom,
          isLeft: true,
        });
      }
    });


    this.eventBus.on('loaded-protyle-static', ({ detail }) => {
      if (detail.protyle) {
        this.protyles.set(detail.protyle.toolbar.element, detail.protyle);
        this.injectButton();
      }
    })
  }

  toggleShowToolbarOnTop() {
    if (this.config.showToolbarOnTop) {
      this.destroyStyle(styleId);
      this.config.showToolbarOnTop = false;
    } else {
      this.createStyle(styleId, styleContent);
      this.config.showToolbarOnTop = true;
    }
    this.saveStorage();
  }

  createStyle(id, style) {
    let styleEl = document.getElementById(id);
    if (styleEl) {
      return;
    }
    styleEl = document.createElement("style");
    styleEl.id = id;
    styleEl.innerHTML = style;
    document.head.appendChild(styleEl);
  }

  destroyStyle(id) {
    let styleEl = document.getElementById(id);
    if (styleEl) {
      styleEl.remove();
    }
  }

  async waitForToolbar() {
    const wait = (fn) => {
      if (document.getElementsByClassName("protyle-toolbar").length) {
        fn();
        return true;
      }
      setTimeout(() => {
        wait(fn);
      }, 120);
    };
    return new Promise((resolve) => {
      wait(resolve);
    });
  }

  async injectButton() {
    await this.waitForToolbar();
    const current = getCurrentPage();
    if (!current) {
      return;
    }
    const els = current.getElementsByClassName("protyle-toolbar");
    for (let i = 0; i < els.length; i++) {
      const toolbar = els[i];
      const children = toolbar.children;
      for (const button of children) {
        button.classList.remove("b3-tooltips__n");
        button.classList.remove("b3-tooltips__ne");
        button.classList.add("b3-tooltips__se");
      }
      this.createIndentButton(toolbar);
      this.createOutdentButton(toolbar);
      this.createColumnsUpButton(toolbar);
      this.createColumnsDownButton(toolbar);
      this.createUndoButton(toolbar);
      this.createRedoButton(toolbar);
      this.createDivide2(toolbar);
      this.createAlignButtons(toolbar);
      this.createDivide3(toolbar);
      this.createMoveUpButton(toolbar);
      this.createMoveDownButton(toolbar);
      this.createDivide4(toolbar);
      this.createTableButton(toolbar);
    }
  }

  createUndoButton(toolbar) {
    if (toolbar.querySelector("#undo")) {
      return;
    }
    const button = document.createElement("button");
    button.classList.add(
      "protyle-toolbar__item",
      "b3-tooltips",
      "b3-tooltips__se"
    );
    button.setAttribute("aria-label", this.i18n.undo);
    button.innerHTML = '<svg><use xlink:href="#iconUndo"></use></svg>';
    button.id = "undo";
    const protyle = this.protyles.get(toolbar);
    if (!protyle) {
      return;
    }
    button.addEventListener("click", () => {
      protyle.undo.undo(protyle);
    });
    const ref = toolbar.querySelector('button[data-type="block-ref"]');
    if (ref) { ref.parentNode.insertBefore(button, ref); }
  }

  createRedoButton(toolbar) {
    if (toolbar.querySelector("#redo")) {
      return;
    }
    const button = document.createElement("button");
    button.classList.add(
      "protyle-toolbar__item",
      "b3-tooltips",
      "b3-tooltips__se"
    );
    button.setAttribute("aria-label", this.i18n.redo);
    button.innerHTML = '<svg><use xlink:href="#iconRedo"></use></svg>';
    button.id = "redo";
    const protyle = this.protyles.get(toolbar);
    if (!protyle) {
      return;
    }
    button.addEventListener("click", () => {
      protyle.undo.redo(protyle);
    });
    toolbar.appendChild(button);
    const ref = toolbar.querySelector('button[data-type="block-ref"]');
    if (ref) { ref.parentNode.insertBefore(button, ref); }
  }

  createIndentButton(toolbar) {
    if (toolbar.querySelector("#indent")) {
      return;
    }
    const button = document.createElement("button");
    button.classList.add(
      "protyle-toolbar__item",
      "b3-tooltips",
      "b3-tooltips__se"
    );
    button.setAttribute("aria-label", this.i18n.indent);
    button.innerHTML = '<svg><use xlink:href="#iconIndent"></use></svg>';
    button.id = "indent";
    button.addEventListener("click", () => {
      const blocks = this.getSelectedBlocks();
      if (blocks) {
        blocks.forEach((b) => this.indent(b));
      }
    });
    toolbar.appendChild(button);
  }

  createOutdentButton(toolbar) {
    if (toolbar.querySelector("#outdent")) {
      return;
    }
    const button = document.createElement("button");
    button.classList.add(
      "protyle-toolbar__item",
      "b3-tooltips",
      "b3-tooltips__se"
    );
    button.setAttribute("aria-label", this.i18n.outdent);
    button.innerHTML = '<svg><use xlink:href="#iconOutdent"></use></svg>';
    button.id = "outdent";
    button.addEventListener("click", () => {
      const blocks = this.getSelectedBlocks();
      if (blocks) {
        blocks.forEach((b) => this.outdent(b));
      }
    });
    toolbar.appendChild(button);
  }

  createColumnsUpButton(toolbar) {
    if (toolbar.querySelector("#columns-up")) {
      return;
    }
    const button = document.createElement("button");
    button.classList.add(
      "protyle-toolbar__item",
      "b3-tooltips",
      "b3-tooltips__se"
    );
    button.setAttribute("aria-label", this.i18n.columnsUp);
    button.innerHTML = '<svg><use xlink:href="#iconColumnsUp"></use></svg>';
    button.id = "columns-up";
    button.addEventListener("click", () => {
      const blocks = this.getSelectedBlocks();
      if (blocks) {
        blocks.forEach((b) => this.columnsUp(b));
      }
    });
    toolbar.appendChild(button);
  }

  createColumnsDownButton(toolbar) {
    if (toolbar.querySelector("#columns-down")) {
      return;
    }
    const button = document.createElement("button");
    button.classList.add(
      "protyle-toolbar__item",
      "b3-tooltips",
      "b3-tooltips__se"
    );
    button.setAttribute("aria-label", this.i18n.columnsDown);
    button.innerHTML = '<svg><use xlink:href="#iconColumnsDown"></use></svg>';
    button.id = "columns-down";
    button.addEventListener("click", () => {
      const blocks = this.getSelectedBlocks();
      if (blocks) {
        blocks.forEach((b) => this.columnsDown(b));
      }
    });
    toolbar.appendChild(button);
  }

  createDivide2(toolbar) {
    if (toolbar.querySelector('div#divide-2')) {
      return;
    }
    toolbar.querySelector('#redo').insertAdjacentHTML('afterEnd', '<div id="divide-2" class="protyle-toolbar__divider b3-tooltips__se"></div>')
  }

  createAlignButtons(toolbar) {
    if (toolbar.querySelector("#align-left")) return;

    const items = [
      { id: "align-left", icon: "iconAlignLeft", label: this.i18n.alignLeft, value: "left" },
      { id: "align-center", icon: "iconAlignCenter", label: this.i18n.alignCenter, value: "center" },
      { id: "align-right", icon: "iconAlignRight", label: this.i18n.alignRight, value: "right" },
      { id: "align-justify", icon: "iconMenu", label: this.i18n.alignJustify, value: "justify" },
    ];
    const ref = toolbar.querySelector('#divide-2');
    const fragment = document.createDocumentFragment();
    items.forEach(({ id, icon, label, value }) => {
      const button = document.createElement("button");
      button.classList.add("protyle-toolbar__item", "b3-tooltips", "b3-tooltips__se");
      button.setAttribute("aria-label", label);
      button.innerHTML = `<svg><use xlink:href="#${icon}"></use></svg>`;
      button.id = id;
      button.addEventListener("click", () => this.setTextAlign(toolbar, value));
      fragment.appendChild(button);
    });
    ref.parentNode.insertBefore(fragment, ref.nextSibling);
  }

  async setTextAlign(toolbar, value) {
    const protyle = this.protyles.get(toolbar);
    if (!protyle) return;

    const blockElements = [];
    const selected = protyle.wysiwyg.element.querySelectorAll(".protyle-wysiwyg--select");
    if (selected && selected.length > 0) {
      selected.forEach(s => blockElements.push(s));
    } else {
      const el = this.getCursorBlockElement(protyle);
      if (el) blockElements.push(el);
    }

    if (blockElements.length === 0) return;

    const doOperations = [];
    const undoOperations = [];

    blockElements.forEach(el => {
      const id = el.getAttribute("data-node-id");
      const oldHTML = el.outerHTML;
      if (el.style.textAlign === value) {
        el.style.textAlign = "";
      } else {
        el.style.textAlign = value;
      }
      const newHTML = el.outerHTML;
      doOperations.push({ action: "update", id, data: newHTML });
      undoOperations.push({ action: "update", id, data: oldHTML });
      el.classList.remove("protyle-wysiwyg--select");
    });

    const appId = window.siyuan.config.system.appId;
    await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session: appId,
        app: appId,
        transactions: [{ doOperations, undoOperations }]
      })
    });
  }

  getCursorBlockElement(protyle) {
    const selection = window.getSelection();
    if (!selection.rangeCount) return null;
    const range = selection.getRangeAt(0);
    let el = range.commonAncestorContainer;
    while (el && el.parentElement) {
      const p = el.parentElement;
      if (p.tagName === "DIV" && p.hasAttribute("data-node-id")) {
        return p;
      }
      el = p;
    }
    return null;
  }



  createDivide3(toolbar) {
    if (toolbar.querySelector('div#divide-3')) return;
    const ref = toolbar.querySelector('#align-justify') || toolbar.querySelector('#align-center') || toolbar.querySelector('#redo');
    ref.insertAdjacentHTML('afterEnd', '<div id="divide-3" class="protyle-toolbar__divider b3-tooltips__se"></div>')
  }

  createDivide4(toolbar) {
    if (toolbar.querySelector('div#divide-4')) return;
    const ref = toolbar.querySelector('#move-down') || toolbar.querySelector('#move-up');
    if (ref) {
      ref.insertAdjacentHTML('afterEnd', '<div id="divide-4" class="protyle-toolbar__divider b3-tooltips__se"></div>')
    }
  }

  createMoveUpButton(toolbar) {
    if (toolbar.querySelector("#move-up")) return;
    const button = document.createElement("button");
    button.classList.add("protyle-toolbar__item", "b3-tooltips", "b3-tooltips__se");
    button.setAttribute("aria-label", this.i18n.moveUp);
    button.innerHTML = '<svg><use xlink:href="#iconUp"></use></svg>';
    button.id = "move-up";
    button.addEventListener("click", async () => {
      const protyle = this.protyles.get(toolbar);
      if (!protyle) return;
      const moveEl = this.getMoveBlockElement(protyle);
      if (!moveEl) return;
      await this.performMove(toolbar, moveEl, 'up');
    });
    const ref = toolbar.querySelector('#divide-3');
    if (ref) {
      ref.parentNode.insertBefore(button, ref.nextSibling);
    }
  }

  createMoveDownButton(toolbar) {
    if (toolbar.querySelector("#move-down")) return;
    const button = document.createElement("button");
    button.classList.add("protyle-toolbar__item", "b3-tooltips", "b3-tooltips__se");
    button.setAttribute("aria-label", this.i18n.moveDown);
    button.innerHTML = '<svg><use xlink:href="#iconDown"></use></svg>';
    button.id = "move-down";
    button.addEventListener("click", async () => {
      const protyle = this.protyles.get(toolbar);
      if (!protyle) return;
      const moveEl = this.getMoveBlockElement(protyle);
      if (!moveEl) return;
      await this.performMove(toolbar, moveEl, 'down');
    });
    const ref = toolbar.querySelector('#move-up');
    if (ref) {
      ref.parentNode.insertBefore(button, ref.nextSibling);
    }
  }

  getMoveBlockElement(protyle) {
    const selection = window.getSelection();
    if (!selection.rangeCount) return null;
    const range = selection.getRangeAt(0);
    let el = range.commonAncestorContainer;
    while (el && el.parentElement) {
      if (el.nodeType === 1 && el.hasAttribute('data-node-id')) {
        const parent = el.parentElement;
        if (parent.classList.contains('protyle-wysiwyg') || parent.classList.contains('list')) {
          return el;
        }
      }
      el = el.parentElement;
    }
    return null;
  }

  async performMove(toolbar, moveEl, direction) {
    const protyle = this.protyles.get(toolbar);
    if (!protyle) return;
    const parent = moveEl.parentElement;
    const moveId = moveEl.getAttribute('data-node-id');
    const parentId = parent.getAttribute('data-node-id') || protyle.block.parentID;

    if (direction === 'up') {
      let sibling = moveEl.previousElementSibling;
      while (sibling && this.isNonBlockElement(sibling)) {
        sibling = sibling.previousElementSibling;
      }
      if (!sibling) return;

      const siblingId = sibling.getAttribute('data-node-id');
      let prevOfSibling = sibling.previousElementSibling;
      while (prevOfSibling && this.isNonBlockElement(prevOfSibling)) {
        prevOfSibling = prevOfSibling.previousElementSibling;
      }
      const prevOfSiblingId = prevOfSibling ? prevOfSibling.getAttribute('data-node-id') : null;

      parent.insertBefore(moveEl, sibling);

      const doOperations = [{ action: "move", id: moveId, previousID: prevOfSiblingId, parentID: parentId }];
      const undoOperations = [{ action: "move", id: moveId, previousID: siblingId, parentID: parentId }];
      await this.sendTransaction(doOperations, undoOperations);
    } else {
      let sibling = moveEl.nextElementSibling;
      while (sibling && this.isNonBlockElement(sibling)) {
        sibling = sibling.nextElementSibling;
      }
      if (!sibling) return;

      let prevOfMove = moveEl.previousElementSibling;
      while (prevOfMove && this.isNonBlockElement(prevOfMove)) {
        prevOfMove = prevOfMove.previousElementSibling;
      }
      const prevOfMoveId = prevOfMove ? prevOfMove.getAttribute('data-node-id') : null;
      const siblingId = sibling.getAttribute('data-node-id');

      parent.insertBefore(sibling, moveEl);

      const doOperations = [{ action: "move", id: siblingId, previousID: prevOfMoveId, parentID: parentId }];
      const undoOperations = [{ action: "move", id: siblingId, previousID: moveId, parentID: parentId }];
      await this.sendTransaction(doOperations, undoOperations);
    }

    this.focusBlock(protyle, moveId);
  }

  isNonBlockElement(el) {
    return el.classList.contains('protyle-attr') || el.classList.contains('protyle-action') || el.classList.contains('protyle-icon');
  }

  async sendTransaction(doOperations, undoOperations) {
    const appId = window.siyuan.config.system.appId;
    await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session: appId, app: appId,
        transactions: [{ doOperations, undoOperations }]
      })
    });
  }

  focusBlock(protyle, blockId) {
    try {
      const el = protyle.wysiwyg.element.querySelector(`[data-node-id="${blockId}"]`);
      if (el) {
        const range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(true);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      }
    } catch (e) {}
  }

  createTableButton(toolbar) {
    if (toolbar.querySelector("#insert-table")) return;
    const button = document.createElement("button");
    button.classList.add("protyle-toolbar__item", "b3-tooltips", "b3-tooltips__se");
    button.setAttribute("aria-label", this.i18n.insertTable);
    button.innerHTML = '<svg><use xlink:href="#iconTable"></use></svg>';
    button.id = "insert-table";
    button.addEventListener("click", () => this.showTablePopup(toolbar, button));
    const ref = toolbar.querySelector('#move-down');
    if (ref) {
      ref.parentNode.insertBefore(button, ref.nextSibling);
    }
  }

  showTablePopup(toolbar, button) {
    const existing = document.getElementById("table-popup");
    if (existing) { existing.remove(); return }

    const popup = document.createElement("div");
    popup.id = "table-popup";
    popup.style.cssText = 'position:fixed;z-index:9999;padding:8px;background:var(--b3-menu-background);border:1px solid var(--b3-border-color);border-radius:4px;box-shadow:0 2px 8px rgba(0,0,0,0.15);min-width:180px';

    const maxGrid = 10;
    const gridLabel = document.createElement("div");
    gridLabel.style.cssText = 'text-align:center;font-size:12px;margin-bottom:6px;color:var(--b3-theme-on-background)';
    gridLabel.textContent = '3 × 3';
    popup.appendChild(gridLabel);

    const grid = document.createElement("div");
    grid.style.cssText = `display:grid;grid-template-columns:repeat(${maxGrid},18px);gap:1px;margin-bottom:6px`;
    grid.id = "table-grid";
    const cells = [];
    for (let r = 0; r < maxGrid; r++) {
      for (let c = 0; c < maxGrid; c++) {
        const cell = document.createElement("div");
        cell.dataset.r = r;
        cell.dataset.c = c;
        cell.style.cssText = 'width:18px;height:18px;background:var(--b3-theme-background);border:1px solid var(--b3-border-color);cursor:pointer';
        grid.appendChild(cell);
        cells.push(cell);
      }
    }
    popup.appendChild(grid);

    const inputArea = document.createElement("div");
    inputArea.style.cssText = 'display:flex;align-items:center;justify-content:center;gap:4px;margin-bottom:6px';
    inputArea.innerHTML = `
      <input id="table-rows" type="number" min="1" max="100" value="3" style="width:50px;padding:2px 4px;border:1px solid var(--b3-border-color);border-radius:2px;background:var(--b3-theme-background);color:var(--b3-theme-on-background);font-size:12px">
      <span style="font-size:12px;color:var(--b3-theme-on-background)">×</span>
      <input id="table-cols" type="number" min="1" max="100" value="3" style="width:50px;padding:2px 4px;border:1px solid var(--b3-border-color);border-radius:2px;background:var(--b3-theme-background);color:var(--b3-theme-on-background);font-size:12px">
    `;
    popup.appendChild(inputArea);

    const btnRow = document.createElement("div");
    btnRow.style.cssText = 'display:flex;gap:4px';
    const insertBtn = document.createElement("button");
    insertBtn.className = 'b3-button b3-button--outline';
    insertBtn.style.cssText = 'flex:1;font-size:12px;padding:4px';
    insertBtn.textContent = this.i18n.insert || 'Insert';
    btnRow.appendChild(insertBtn);
    popup.appendChild(btnRow);

    let selectedR = 0, selectedC = 0;

    const highlight = (r, c) => {
      selectedR = Math.min(r + 1, maxGrid);
      selectedC = Math.min(c + 1, maxGrid);
      cells.forEach(cell => {
        const cr = parseInt(cell.dataset.r), cc = parseInt(cell.dataset.c);
        cell.style.background = (cr < selectedR && cc < selectedC) ? 'var(--b3-theme-primary)' : 'var(--b3-theme-background)';
      });
      gridLabel.textContent = `${selectedR} × ${selectedC}`;
    };

    const updateInputs = () => {
      const rv = parseInt(inputArea.querySelector('#table-rows').value) || 1;
      const cv = parseInt(inputArea.querySelector('#table-cols').value) || 1;
      gridLabel.textContent = `${rv} × ${cv}`;
      selectedR = rv;
      selectedC = cv;
      cells.forEach(cell => {
        const cr = parseInt(cell.dataset.r), cc = parseInt(cell.dataset.c);
        cell.style.background = (cr < Math.min(rv, maxGrid) && cc < Math.min(cv, maxGrid)) ? 'var(--b3-theme-primary)' : 'var(--b3-theme-background)';
      });
    };

    grid.addEventListener('mouseover', (e) => {
      const cell = e.target.closest('div');
      if (!cell || !cell.dataset.r) return;
      highlight(parseInt(cell.dataset.r), parseInt(cell.dataset.c));
      inputArea.querySelector('#table-rows').value = selectedR;
      inputArea.querySelector('#table-cols').value = selectedC;
    });

    grid.addEventListener('click', (e) => {
      const cell = e.target.closest('div');
      if (!cell || !cell.dataset.r) return;
      highlight(parseInt(cell.dataset.r), parseInt(cell.dataset.c));
      inputArea.querySelector('#table-rows').value = selectedR;
      inputArea.querySelector('#table-cols').value = selectedC;
      insertBtn.click();
    });

    inputArea.querySelector('#table-rows').addEventListener('input', updateInputs);
    inputArea.querySelector('#table-cols').addEventListener('input', updateInputs);

    insertBtn.addEventListener('click', async () => {
      const rows = Math.max(1, parseInt(inputArea.querySelector('#table-rows').value) || 1);
      const cols = Math.max(1, parseInt(inputArea.querySelector('#table-cols').value) || 1);
      await this.insertTable(toolbar, rows, cols);
      popup.remove();
    });

    document.body.appendChild(popup);
    const rect = button.getBoundingClientRect();
    const popupRect = popup.getBoundingClientRect();
    popup.style.top = (rect.bottom + 4) + 'px';
    popup.style.left = Math.min(rect.left, window.innerWidth - popupRect.width - 8) + 'px';

    setTimeout(() => {
      const handler = (e) => {
        if (!popup.contains(e.target) && e.target !== button) {
          popup.remove();
          document.removeEventListener('click', handler);
        }
      };
      document.addEventListener('click', handler);
    }, 0);
  }

  async insertTable(toolbar, rows, cols) {
    const protyle = this.protyles.get(toolbar);
    if (!protyle) return;

    let mdTable = `| ${Lute.Caret || ' '}`;
    for (let c = 1; c < cols; c++) mdTable += ' | ';
    mdTable += ' |\n|';
    for (let c = 0; c < cols; c++) mdTable += ' --- |';
    for (let r = 0; r < rows - 1; r++) {
      mdTable += '\n|';
      for (let c = 0; c < cols; c++) mdTable += '  |';
    }

    try {
      if (protyle.hint && typeof protyle.hint.fill === 'function') {
        protyle.hint.splitChar = '/';
        protyle.hint.lastIndex = -1;
        protyle.hint.fill(mdTable, protyle, false);
      } else {
        await this.insertTableViaAPI(protyle, mdTable);
      }
    } catch (e) {
      await this.insertTableViaAPI(protyle, mdTable);
    }
  }

  async insertTableViaAPI(protyle, mdTable) {
    const blockEl = this.getCursorBlockElement(protyle);
    if (!blockEl) return;
    const blockId = blockEl.getAttribute('data-node-id');
    const parent = blockEl.parentElement;
    const parentId = parent.getAttribute('data-node-id') || protyle.block.parentID;

    const res = await fetch('/api/block/insertBlock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dataType: 'markdown',
        data: mdTable,
        parentID: parentId,
        previousID: blockId
      })
    }).then(r => r.json());
    if (res.code !== 0) {
      console.warn('insertBlock failed, trying hint.fill');
    }
  }

  onunload() {
    this.destroyStyle(styleId);
    this.destroyStyle(docStyleId);
    unwatchPageChange();
  }

  getSelectedBlocks() {
    const current = getCurrentPage();
    if (!current) {
      return null;
    }
    const selected = current.querySelectorAll(".protyle-wysiwyg--select");
    if (selected && selected.length) {
      const result = [];
      for (const s of selected) {
        result.push(s.getAttribute("data-node-id"));
      }
      return result;
    }
    // get by cursor
    const block = this.getCursorBlock();
    if (!block) {
      return null;
    }
    return [block];
  }

  getCursorBlock() {
    const selection = window.getSelection().getRangeAt(0);
    let el = selection.commonAncestorContainer;
    while (el && el.parentElement) {
      const p = el.parentElement;
      if (p.tagName.toUpperCase() === "DIV" && p.hasAttribute("data-node-id")) {
        return p.getAttribute("data-node-id");
      }
      el = p;
    }
    return null;
  }

  async indent(block) {
    const attrs = await this.readAttrs(block);
    const indent = attrs[indentProperty];
    if (!indent) {
      attrs[indentProperty] = "1";
    } else {
      attrs[indentProperty] = `${parseInt(attrs[indentProperty]) + 1}`;
    }
    await this.writeAttr(block, attrs);
  }

  async outdent(block) {
    const attrs = await this.readAttrs(block);
    const indent = attrs[indentProperty];
    if (!indent) {
      return;
    }
    let i = parseInt(attrs[indentProperty]) - 1;
    if (i < 0) {
      i = 0;
    }
    attrs[indentProperty] = `${i}`;
    await this.writeAttr(block, attrs);
  }

  async columnsUp(block) {
    const attrs = await this.readAttrs(block);
    const indent = attrs[columnsProperty];
    if (!indent) {
      attrs[columnsProperty] = "2";
    } else {
      attrs[columnsProperty] = `${parseInt(attrs[columnsProperty]) + 1}`;
    }
    await this.writeAttr(block, attrs);
  }

  async columnsDown(block) {
    const attrs = await this.readAttrs(block);
    const indent = attrs[columnsProperty];
    if (!indent) {
      return;
    }
    let i = parseInt(attrs[columnsProperty]) - 1;
    if (i < 1) {
      i = 1;
    }
    attrs[columnsProperty] = `${i}`;
    await this.writeAttr(block, attrs);
  }

  async readAttrs(block) {
    const attrs = await getBlockAttrs(block);
    return attrs;
  }

  async writeAttr(block, attrs) {
    return await setBlockAttrs(block, attrs);
  }
};

let oldId = null;
let timer = null;

function watchCurrentPageChange(fn) {
  timer = setTimeout(() => {
    watchCurrentPageChange(fn);
    let id = getCurrentPage();
    if (!id) {
      return;
    }
    if (oldId === id) {
      return;
    }
    oldId = id;
    fn();
  }, 100);
}

function unwatchPageChange() {
  if (timer) {
    clearTimeout(timer);
  }
}

function getCurrentPage() {
  let currentScreen;
  let currentPage;
  try {
    //获取当前屏幕
    currentScreen = document.querySelector(".layout__wnd--active");
    //获取当前页面
    currentPage = currentScreen.querySelector(
      ".fn__flex-1.protyle:not(.fn__none)"
    );
    return currentPage;
  } catch (e) {
    return null;
  }
}
