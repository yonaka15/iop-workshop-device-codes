document.addEventListener('DOMContentLoaded', () => {
  const codeBlocks = document.querySelectorAll('pre.highlight');

  codeBlocks.forEach((codeBlock) => {
    const copyButton = document.createElement('button');
    copyButton.className = 'copy-code-button';
    copyButton.textContent = 'Copy';
    codeBlock.parentNode.insertBefore(copyButton, codeBlock);

    copyButton.addEventListener('click', () => {
      const codeToCopy = codeBlock.querySelector('code').innerText;
      navigator.clipboard.writeText(codeToCopy).then(() => {
        copyButton.textContent = 'Copied!';
        setTimeout(() => {
          copyButton.textContent = 'Copy';
        }, 2000);
      }).catch(err => {
        console.error('Failed to copy code: ', err);
        copyButton.textContent = 'Error';
         setTimeout(() => {
          copyButton.textContent = 'Copy';
        }, 2000);
      });
    });
  });
});