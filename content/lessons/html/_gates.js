/*  AESDR Accountability Gates v1
 *  Inject into lesson HTML files alongside role-detection.
 *
 *  Usage in lesson JS:
 *    AESDR.gate(3, { type:'reflection', prompt:'...', minChars:100 });
 *    AESDR.gate(1, { type:'time', seconds:60 });
 *    AESDR.gate(7, { type:'application', prompt:'...', rubric:['Did X','Did Y'], minChars:80 });
 *    AESDR.gate(8, { type:'evidence', prompt:'Paste your...', minChars:50 });
 *
 *  In canContinue():
 *    if (!AESDR.gateReady(cur)) return false;
 *
 *  Gate state auto-saves via postMessage when completed.
 */
window.AESDR = window.AESDR || {};

(function(A) {
  var gates = {};      // screenNum -> config
  var gateState = {};  // screenNum -> { completed, value, ... }
  var timers = {};     // screenNum -> { started, remaining }

  /* ── Register a gate ── */
  A.gate = function(screen, cfg) {
    gates[screen] = cfg;
    gateState[screen] = { completed: false, value: '' };
  };

  /* ── Check if gate is satisfied ── */
  A.gateReady = function(screen) {
    if (!gates[screen]) return true;
    return gateState[screen] && gateState[screen].completed;
  };

  /* ── Get gate hint text ── */
  A.gateHint = function(screen) {
    var g = gates[screen];
    if (!g) return '';
    var s = gateState[screen];
    if (s.completed) return '\u2713 Gate complete';

    if (g.type === 'time') {
      var r = timers[screen] ? timers[screen].remaining : g.seconds;
      return r > 0 ? 'Unlocks in ' + r + 's' : '';
    }
    if (g.type === 'reflection' || g.type === 'evidence' || g.type === 'narrative') {
      var len = (s.value || '').length;
      return len + ' / ' + g.minChars + ' characters';
    }
    if (g.type === 'application') {
      var len2 = (s.value || '').length;
      var checks = s.rubricChecked || 0;
      var total = (g.rubric || []).length;
      return len2 + ' chars \u00B7 ' + checks + '/' + total + ' rubric items';
    }
    if (g.type === 'homework') {
      var done = 0;
      for (var j = 0; j < (g.items || []).length; j++) {
        if (s._hwDone && s._hwDone[j]) done++;
      }
      return done + ' / ' + (g.items || []).length + ' items completed';
    }
    return '';
  };

  /* ── Get all gate data for stateData (progress saving) ── */
  A.gateData = function() {
    var out = {};
    for (var k in gateState) {
      if (gateState[k].completed) {
        out['gate_' + k] = {
          type: gates[k].type,
          value: gateState[k].value,
          completedAt: gateState[k].completedAt
        };
      }
    }
    return out;
  };

  /* ── Render gate UI into a container ── */
  A.renderGate = function(screen, containerId) {
    var g = gates[screen];
    if (!g) return;
    var el = document.getElementById(containerId);
    if (!el) return;
    var s = gateState[screen];

    if (s.completed) {
      el.innerHTML = _completedHTML(g, s);
      return;
    }

    switch(g.type) {
      case 'reflection': el.innerHTML = _reflectionHTML(screen, g, s); break;
      case 'application': el.innerHTML = _applicationHTML(screen, g, s); break;
      case 'evidence': el.innerHTML = _evidenceHTML(screen, g, s); break;
      case 'narrative': el.innerHTML = _narrativeHTML(screen, g, s); break;
      case 'homework': el.innerHTML = _homeworkHTML(screen, g, s); break;
      case 'time': _startTimer(screen, g); el.innerHTML = _timeHTML(screen, g); break;
    }
  };

  /* ── Completed state ── */
  function _completedHTML(g, s) {
    var typeLabel = { reflection:'Reflection', application:'Response', evidence:'Evidence', time:'Time', narrative:'Reflection', homework:'Checklist' };
    return '<div class="gate-done">' +
      '<div class="gate-done-tag">\u2713 ' + (typeLabel[g.type]||'Gate') + ' Submitted</div>' +
      (g.type !== 'time' ? '<div class="gate-done-preview">' + _esc(s.value).substring(0,200) + (s.value.length > 200 ? '...' : '') + '</div>' : '') +
    '</div>';
  }

  /* ── Reflection Gate ── */
  function _reflectionHTML(screen, g) {
    return '<div class="gate-box">' +
      '<div class="gate-label">Reflection Required</div>' +
      '<p class="gate-prompt">' + g.prompt + '</p>' +
      '<textarea class="gate-textarea" id="gateTA' + screen + '" ' +
        'placeholder="' + _esc(g.placeholder || 'Write your reflection here...') + '" ' +
        'oninput="AESDR._onInput(' + screen + ',this.value)">' +
      '</textarea>' +
      '<div class="gate-footer">' +
        '<span class="gate-counter" id="gateCtr' + screen + '">0 / ' + g.minChars + '</span>' +
        '<button class="gate-submit" id="gateSub' + screen + '" disabled ' +
          'onclick="AESDR._submit(' + screen + ')">Submit Reflection</button>' +
      '</div>' +
    '</div>';
  }

  /* ── Application Gate ── */
  function _applicationHTML(screen, g) {
    var rubricHTML = (g.rubric || []).map(function(r, i) {
      return '<label class="gate-rubric-item">' +
        '<input type="checkbox" onchange="AESDR._onRubric(' + screen + ',' + i + ',this.checked)">' +
        '<span>' + r + '</span></label>';
    }).join('');

    return '<div class="gate-box">' +
      '<div class="gate-label">Application Required</div>' +
      '<p class="gate-prompt">' + g.prompt + '</p>' +
      '<textarea class="gate-textarea" id="gateTA' + screen + '" ' +
        'placeholder="' + _esc(g.placeholder || 'Write your response...') + '" ' +
        'oninput="AESDR._onInput(' + screen + ',this.value)">' +
      '</textarea>' +
      '<div class="gate-counter" id="gateCtr' + screen + '">0 / ' + (g.minChars || 50) + ' characters</div>' +
      (rubricHTML ? '<div class="gate-rubric"><div class="gate-rubric-label">Self-evaluate your response:</div>' + rubricHTML + '</div>' : '') +
      '<div class="gate-footer">' +
        '<button class="gate-submit" id="gateSub' + screen + '" disabled ' +
          'onclick="AESDR._submit(' + screen + ')">Submit Response</button>' +
      '</div>' +
    '</div>';
  }

  /* ── Evidence Gate ── */
  function _evidenceHTML(screen, g) {
    return '<div class="gate-box">' +
      '<div class="gate-label">Evidence Required</div>' +
      '<p class="gate-prompt">' + g.prompt + '</p>' +
      '<textarea class="gate-textarea gate-evidence" id="gateTA' + screen + '" ' +
        'placeholder="' + _esc(g.placeholder || 'Paste your evidence here...') + '" ' +
        'oninput="AESDR._onInput(' + screen + ',this.value)">' +
      '</textarea>' +
      '<div class="gate-footer">' +
        '<span class="gate-counter" id="gateCtr' + screen + '">0 / ' + g.minChars + '</span>' +
        '<button class="gate-submit" id="gateSub' + screen + '" disabled ' +
          'onclick="AESDR._submit(' + screen + ')">Submit Evidence</button>' +
      '</div>' +
    '</div>';
  }

  /* ── Narrative Gate (lightweight reflection on reading screens) ── */
  function _narrativeHTML(screen, g) {
    return '<div class="gate-box gate-narrative">' +
      '<div class="gate-label">Before You Continue</div>' +
      '<p class="gate-prompt">' + g.prompt + '</p>' +
      '<textarea class="gate-textarea gate-textarea-sm" id="gateTA' + screen + '" ' +
        'placeholder="' + _esc(g.placeholder || 'Be specific. One real example.') + '" ' +
        'oninput="AESDR._onInput(' + screen + ',this.value)">' +
      '</textarea>' +
      '<div class="gate-footer">' +
        '<span class="gate-counter" id="gateCtr' + screen + '">0 / ' + g.minChars + '</span>' +
        '<button class="gate-submit" id="gateSub' + screen + '" disabled ' +
          'onclick="AESDR._submit(' + screen + ')">Continue</button>' +
      '</div>' +
    '</div>';
  }

  /* ── Homework Gate (enforceable checkbox sub-gates) ── */
  function _homeworkHTML(screen, g) {
    var items = g.items || [];
    var s = gateState[screen];
    if (!s._hwDone) s._hwDone = {};
    if (!s._hwText) s._hwText = {};

    var html = '<div class="gate-box gate-homework">' +
      '<div class="gate-label">Accountability Checklist</div>' +
      '<p class="gate-prompt">' + (g.prompt || 'Complete each item below. No shortcuts.') + '</p>' +
      '<div class="gate-conscience">' +
        '<p class="gate-conscience-text">You can treat this like just another course if you want. Or you can not lie and complete this survival checklist legitimately. What you do when no one is watching makes all the difference in the end.</p>' +
      '</div>' +
      '<div class="hw-gate-items">';

    for (var i = 0; i < items.length; i++) {
      var done = s._hwDone[i];
      html += '<div class="hw-gate-item' + (done ? ' hw-gate-done' : '') + '" id="hwItem' + screen + '_' + i + '">' +
        '<div class="hw-gate-check">' + (done ? '\u2713' : (i + 1)) + '</div>' +
        '<div class="hw-gate-body">' +
          '<p class="hw-gate-task">' + items[i].task + '</p>' +
          (done
            ? '<div class="hw-gate-submitted">' + _esc(s._hwText[i]).substring(0,200) + '</div>'
            : '<textarea class="gate-textarea gate-textarea-sm" id="hwTA' + screen + '_' + i + '" ' +
                'placeholder="' + _esc(items[i].placeholder || 'Your response...') + '" ' +
                'oninput="AESDR._onHwInput(' + screen + ',' + i + ',this.value)"></textarea>' +
              '<div class="hw-gate-row">' +
                '<span class="gate-counter" id="hwCtr' + screen + '_' + i + '">0 / ' + (items[i].minChars || 30) + '</span>' +
                '<button class="gate-submit gate-submit-sm" id="hwSub' + screen + '_' + i + '" disabled ' +
                  'onclick="AESDR._submitHw(' + screen + ',' + i + ')">Done</button>' +
              '</div>'
          ) +
        '</div>' +
      '</div>';
    }

    html += '</div></div>';
    return html;
  }

  /* ── Time Gate ── */
  function _timeHTML(screen, g) {
    var r = timers[screen] ? timers[screen].remaining : g.seconds;
    if (r <= 0) return '';
    return '<div class="gate-time" id="gateTime' + screen + '">' +
      '<span class="gate-time-icon">\u23F3</span> ' +
      '<span class="gate-time-num" id="gateTimeCtr' + screen + '">' + r + '</span>s remaining' +
    '</div>';
  }

  function _startTimer(screen, g) {
    if (timers[screen]) return;
    timers[screen] = { remaining: g.seconds };
    var iv = setInterval(function() {
      timers[screen].remaining--;
      var el = document.getElementById('gateTimeCtr' + screen);
      if (el) el.textContent = timers[screen].remaining;
      if (timers[screen].remaining <= 0) {
        clearInterval(iv);
        gateState[screen].completed = true;
        gateState[screen].completedAt = new Date().toISOString();
        var timeEl = document.getElementById('gateTime' + screen);
        if (timeEl) timeEl.style.display = 'none';
        // Trigger render if the lesson exposes it
        if (typeof window.render === 'function') window.render();
      }
    }, 1000);
  }

  /* ── Internal handlers ── */
  A._onInput = function(screen, val) {
    gateState[screen].value = val;
    var g = gates[screen];
    var min = g.minChars || 50;
    var ctr = document.getElementById('gateCtr' + screen);
    if (ctr) ctr.textContent = val.length + ' / ' + min + (g.type === 'application' ? ' characters' : '');

    var btn = document.getElementById('gateSub' + screen);
    if (btn) {
      var ready = val.length >= min;
      if (g.type === 'application' && g.rubric) {
        var checks = gateState[screen].rubricChecked || 0;
        ready = ready && checks >= g.rubric.length;
      }
      btn.disabled = !ready;
    }
  };

  /* ── Homework sub-gate input handler ── */
  A._onHwInput = function(screen, idx, val) {
    var s = gateState[screen];
    if (!s._hwText) s._hwText = {};
    s._hwText[idx] = val;
    var g = gates[screen];
    var min = (g.items && g.items[idx] && g.items[idx].minChars) || 30;
    var ctr = document.getElementById('hwCtr' + screen + '_' + idx);
    if (ctr) ctr.textContent = val.length + ' / ' + min;
    var btn = document.getElementById('hwSub' + screen + '_' + idx);
    if (btn) btn.disabled = val.length < min;
  };

  /* ── Homework sub-gate submit handler ── */
  A._submitHw = function(screen, idx) {
    var s = gateState[screen];
    if (!s._hwDone) s._hwDone = {};
    s._hwDone[idx] = true;
    var g = gates[screen];
    var allDone = true;
    for (var i = 0; i < g.items.length; i++) {
      if (!s._hwDone[i]) { allDone = false; break; }
    }
    if (allDone) {
      s.completed = true;
      s.completedAt = new Date().toISOString();
      s.value = JSON.stringify(s._hwText);
    }
    // Re-render the gate
    var containers = document.querySelectorAll('[data-gate-screen="' + screen + '"]');
    containers.forEach(function(el) { A.renderGate(screen, el.id); });
    // Save progress
    if (window.parent !== window) {
      try { window.parent.postMessage({ type: 'aesdr:progress', screen: screen, stateData: A.gateData() }, '*'); } catch(e) {}
    }
    if (typeof window.render === 'function') window.render();
  };

  A._onRubric = function(screen, idx, checked) {
    if (!gateState[screen]._rubric) gateState[screen]._rubric = {};
    gateState[screen]._rubric[idx] = checked;
    var count = 0;
    for (var k in gateState[screen]._rubric) {
      if (gateState[screen]._rubric[k]) count++;
    }
    gateState[screen].rubricChecked = count;

    // Re-check submit button
    var g = gates[screen];
    var val = gateState[screen].value || '';
    var btn = document.getElementById('gateSub' + screen);
    if (btn) {
      btn.disabled = !(val.length >= (g.minChars || 50) && count >= (g.rubric || []).length);
    }
  };

  A._submit = function(screen) {
    var s = gateState[screen];
    s.completed = true;
    s.completedAt = new Date().toISOString();

    // Re-render the gate as completed
    var containers = document.querySelectorAll('[data-gate-screen="' + screen + '"]');
    containers.forEach(function(el) { A.renderGate(screen, el.id); });

    // Save progress via postMessage
    if (window.parent !== window) {
      try {
        window.parent.postMessage({
          type: 'aesdr:progress',
          screen: screen,
          stateData: A.gateData()
        }, '*');
      } catch(e) {}
    }

    // Trigger render if available
    if (typeof window.render === 'function') window.render();
  };

  /* ── Escape helper ── */
  function _esc(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

})(window.AESDR);
