/**
 * Build styles
 */
require("./index.css").toString();

/**
 * Marker Tool for the Editor.js
 *
 * Allows to wrap inline fragment and style it somehow.
 */
class InlineFootnote {
  /**
   * Class name for term-tag
   *
   * @type {string}
   */
  static get CSS() {
    return "cdx-marker";
  }

  /**
   * @param {{api: object}}  - Editor.js API
   */
  constructor({ api }) {
    this.api = api;

    /**
     * Toolbar Button
     *
     * @type {HTMLElement|null}
     */
    this.button = null;

    /**
     * Tag represented the term
     *
     * @type {string}
     */
    this.tag = "MARK";

    /**
     * CSS classes
     */
    this.iconClasses = {
      base: this.api.styles.inlineToolButton,
      active: this.api.styles.inlineToolButtonActive,
    };
  }

  /**
   * Specifies Tool as Inline Toolbar Tool
   *
   * @return {boolean}
   */
  static get isInline() {
    return true;
  }

  /**
   * Get Tool icon's title
   * @return {string}
   */
  static get title() {
    return "参考引用";
  }

  /**
   * Get Tool icon's SVG
   * @return {string}
   */
  get toolboxIcon() {
    return '<svg width="14" height="14" t="1592917690196" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="18340" width="200" height="200"><path d="M756.98176 476.44672H267.12064c-85.0944 0-152.55552-55.99232-152.55552-126.54592 0-70.61504 67.46112-126.54592 152.55552-126.54592h522.11712c23.47008 0 44.05248-17.05984 44.05248-36.5568 0-19.43552-20.48-36.47488-44.05248-36.47488H267.12064c-132.07552 0-240.57856 90.07104-240.57856 199.5776s108.544 199.53664 240.57856 199.53664h489.86112c84.992 0 152.4736 55.99232 152.4736 126.58688s-67.4816 126.58688-152.4736 126.58688H202.52672c-23.38816 0-43.95008 17.03936-43.95008 36.47488 0 19.47648 20.48 36.49536 43.95008 36.49536h554.45504c131.93216 0 240.45568-90.03008 240.45568-199.55712s-108.52352-199.5776-240.45568-199.5776z" p-id="18341"></path><path d="M818.50368 8.02816c-99.67616 0-178.85184 79.1552-178.85184 178.8928 0 99.75808 79.17568 178.93376 178.85184 178.93376a177.78688 177.78688 0 0 0 178.93376-178.93376c0-99.71712-79.21664-178.8928-178.93376-178.8928zM205.57824 658.16576c-99.77856 0-179.03616 79.1552-179.03616 178.8928 0 99.69664 79.2576 178.91328 179.03616 178.91328 99.67616 0 178.83136-79.21664 178.83136-178.91328 0-99.7376-79.1552-178.8928-178.83136-178.8928z" p-id="18342"></path></svg>';
  }

  /**
   * Create button element for Toolbar
   *
   * @return {HTMLElement}
   */
  render() {
    this.button = document.createElement("button");
    this.button.type = "button";
    this.button.classList.add(this.iconClasses.base);
    this.button.innerHTML = this.toolboxIcon;

    return this.button;
  }

  /**
   * Wrap/Unwrap selected fragment
   *
   * @param {Range} range - selected fragment
   */
  surround(range) {
    if (!range) {
      return;
    }

    let termWrapper = this.api.selection.findParentTag(
      this.tag,
      InlineFootnote.CSS
    );

    /**
     * If start or end of selection is in the highlighted block
     */
    if (termWrapper) {
      this.unwrap(termWrapper);
    } else {
      this.wrap(range);
    }
  }

  /**
   * Wrap selection with term-tag
   *
   * @param {Range} range - selected fragment
   */
  wrap(range) {
    /**
     * Create a wrapper for highlighting
     */
    let marker = document.createElement(this.tag);

    marker.classList.add(InlineFootnote.CSS);

    /**
     * SurroundContent throws an error if the Range splits a non-Text node with only one of its boundary points
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Range/surroundContents}
     *
     * // range.surroundContents(span);
     */
    marker.appendChild(range.extractContents());
    range.insertNode(marker);

    /**
     * Expand (add) selection to highlighted block
     */
    this.api.selection.expandToTag(marker);
  }

  /**
   * Unwrap term-tag
   *
   * @param {HTMLElement} termWrapper - term wrapper tag
   */
  unwrap(termWrapper) {
    /**
     * Expand selection to all term-tag
     */
    this.api.selection.expandToTag(termWrapper);

    let sel = window.getSelection();
    let range = sel.getRangeAt(0);

    let unwrappedContent = range.extractContents();

    /**
     * Remove empty term-tag
     */
    termWrapper.parentNode.removeChild(termWrapper);

    /**
     * Insert extracted content
     */
    range.insertNode(unwrappedContent);

    /**
     * Restore selection
     */
    sel.removeAllRanges();
    sel.addRange(range);
  }

  /**
   * Check and change Term's state for current selection
   */
  checkState() {
    const termTag = this.api.selection.findParentTag(
      this.tag,
      InlineFootnote.CSS
    );

    this.button.classList.toggle(this.iconClasses.active, !!termTag);
  }

  /**
   * Sanitizer rule
   * @return {{mark: {class: string}}}
   */
  static get sanitize() {
    return {
      mark: {
        class: InlineFootnote.CSS,
      },
    };
  }
}

module.exports = InlineFootnote;
