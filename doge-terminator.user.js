// ==UserScript==
// @name        Doge Terminator
// @name:zh-CN  狗头终结者
// @description:zh-CN 去除知乎狗头、滑稽、惊喜表情
// @author      lxb007981
// @license     MIT
// @homepageURL https://github.com/lxb007981/doge-terminator
// @match        *://www.zhihu.com/*
// @match        *://zhuanlan.zhihu.com/*
// @exclude      https://www.zhihu.com/signin*
// @version     2023.07.10
// ==/UserScript==

// define some shorthands
var _ = document;
var newNodes = [_.body];

// Recursively traverse the given node and its descendants (Depth-first search)
function scanImgNodes(node) {
    // The node could have been detached from the DOM tree
    if (!node.parentNode || !_.body.contains(node)) {
        return;
    }
    var excludeTags = { ruby: true, script: true, select: true, textarea: true };
    if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.tagName.toLowerCase() in excludeTags || node.isContentEditable) {
            return;
        }
        if (node.tagName.toLowerCase() === 'img' && node.classList.contains('sticker')) {
            if (node.alt === '[doge]') {
                removeSticker(node);
            }
            if (node.alt === '[滑稽]'){
                removeSticker(node);
            }
            if (node.alt === '[惊喜]'){
                removeSticker(node);
            }
        }
        else return node.childNodes.forEach(scanImgNodes);
    }
}

// Split word list into chunks to limit the length of API requests
function removeSticker(node) {
    node.parentNode.replaceChild(document.createTextNode(node.alt), node);
}

// Watch newly added DOM nodes, and save them for later use
function mutationHandler(mutationList) {
    mutationList.forEach(function (mutationRecord) {
        mutationRecord.addedNodes.forEach(function (node) {
            newNodes.push(node);
        });
    });
}

function main() {
    var observer = new MutationObserver(mutationHandler);
    observer.observe(_.body, { childList: true, subtree: true });

    function rescanImgNodes() {
        // Deplete buffered mutations
        mutationHandler(observer.takeRecords());
        if (!newNodes.length) {
            return;
        }

        newNodes.forEach(scanImgNodes);
        newNodes.length = 0;
    }

    // Limit the frequency of API requests
    rescanImgNodes();
    setInterval(rescanImgNodes, 500);
}

// Polyfill for ES5
if (typeof NodeList.prototype.forEach === 'undefined') {
    NodeList.prototype.forEach = function (callback, thisArg) {
        thisArg = thisArg || window;
        for (var i = 0; i < this.length; i++) {
            callback.call(thisArg, this[i], i, this);
        }
    };
}

main();
