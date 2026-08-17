// -------------------- トグル --------------------
function setLogMode(isLog) {
  document.querySelectorAll('.toggle-option')
    .forEach(option => option.classList.toggle('active', option.textContent.trim() === (isLog ? 'ログ' : 'DB')));

  const queryApp = document.querySelector('.app-query');
  const isQueryMode = queryApp && !queryApp.hidden;

  if (isQueryMode) {
    document.querySelector('.query-main').hidden = isLog;
    const queryLogMain = document.querySelector('.query-log-main');
    queryLogMain.hidden = !isLog;
    queryLogMain.classList.toggle('log-mode', isLog);
    const queryCmdSidebar = document.querySelector('.query-cmd-sidebar');
    queryCmdSidebar.hidden = false;
    document.querySelector('.query-schema-sidebar').hidden = isLog;
    queryApp.classList.toggle('query-log-mode', isLog);

    if (isLog) {
      renderSidebarButtons(commands['log-clear'], queryCmdSidebar);
    } else {
      renderCommandPalette();
    }
    return;
  }

  document.getElementById('db-view').classList.toggle('active', !isLog);
  document.getElementById('log-view').classList.toggle('active', isLog);
  document.querySelector('.main').classList.toggle('log-mode', isLog);

  if (isLog) {
    renderSidebarButtons(commands['log-clear']);
    currentTarget = null;
  } else {
    Array.from(sidebar.children).forEach(btn => {
      btn.classList.remove('show');
      setTimeout(() => btn.remove(), 200);
    });
  }
}

document.querySelectorAll('.toggle-option').forEach(option => {
  option.addEventListener('click', () => {
    setLogMode(option.textContent.trim() === 'ログ');
  });
});
