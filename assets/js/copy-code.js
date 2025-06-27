
document.addEventListener('DOMContentLoaded', () => {
  const highlightBlocks = document.querySelectorAll('.highlight');

  highlightBlocks.forEach((block) => {
    const pre = block.querySelector('pre');
    if (!pre) return;

    const copyButton = document.createElement('button');
    copyButton.className = 'rouge-copy';
    copyButton.innerHTML = 'コピー';

    // ラッパー要素を作成
    const wrapper = document.createElement('div');
    wrapper.style.position = 'relative';

    // pre要素をラッパーで囲む
    pre.parentNode.insertBefore(wrapper, pre);
    wrapper.appendChild(pre);
    wrapper.appendChild(copyButton);

    copyButton.addEventListener('click', () => {
      const code = pre.querySelector('code').innerText;
      navigator.clipboard.writeText(code).then(() => {
        copyButton.innerText = 'コピーしました！';
        setTimeout(() => {
          copyButton.innerText = 'コピー';
        }, 2000);
      }, (err) => {
        copyButton.innerText = '失敗';
        console.error('Could not copy text: ', err);
      });
    });
  });
});
