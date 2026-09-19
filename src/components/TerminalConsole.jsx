import React, { useState } from 'react';
import { TERMINAL_COMMANDS } from '../data/mockData.js';
import { soundFx } from '../utils/audio.js';

export default function TerminalConsole() {
  const [history, setHistory] = useState([
    {
      type: 'cmd',
      text: "crimenet query --target 'Cipher_Ghost' --deep-scan"
    },
    ...TERMINAL_COMMANDS[0].output.map(line => ({ type: 'out', text: line }))
  ]);
  const [inputVal, setInputVal] = useState('');

  const executeCommand = (cmdStr) => {
    soundFx.playTacticalClick();
    const cleanCmd = cmdStr.trim();
    if (!cleanCmd) return;

    const newHistory = [...history, { type: 'cmd', text: cleanCmd }];

    // Check for presets
    const match = TERMINAL_COMMANDS.find(t => t.cmd.toLowerCase() === cleanCmd.toLowerCase());
    if (match) {
      match.output.forEach(line => {
        newHistory.push({ type: 'out', text: line });
      });
    } else if (cleanCmd.toLowerCase() === 'help') {
      newHistory.push(
        { type: 'out', text: "Available CrimeNet Autonomous Subsystems:" },
        { type: 'out', text: "  crimenet query --target [name]     Search suspect identity matrix" },
        { type: 'out', text: "  crimenet radar --sector [A-E]       Scan municipal RF and thermal feeds" },
        { type: 'out', text: "  crimenet trace --crypto [addr]      Walk on-chain mixer wash heuristics" },
        { type: 'out', text: "  clear                              Purge terminal console buffer" }
      );
    } else if (cleanCmd.toLowerCase() === 'clear') {
      setHistory([]);
      setInputVal('');
      return;
    } else {
      newHistory.push(
        { type: 'out', text: `[QUERY EXECUTED] Invoking federated crime mesh for '${cleanCmd}'...` },
        { type: 'out', text: `[RESULT] 0 critical anomalies found for custom parameter. Try 'help' for command list.` }
      );
    }

    setHistory(newHistory);
    setInputVal('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      executeCommand(inputVal);
    }
  };

  return (
    <div className="terminal-window">
      {/* Terminal Title Bar */}
      <div className="terminal-header">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span className="terminal-dot" style={{ background: '#ff5f56' }}></span>
          <span className="terminal-dot" style={{ background: '#ffbd2e' }}></span>
          <span className="terminal-dot" style={{ background: '#27c93f' }}></span>
          <span style={{
            fontSize: '0.75rem',
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-secondary)',
            marginLeft: '10px'
          }}>
            crimenet-cli -- session_id=0x9A48 (ROOT ACCESS)
          </span>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => {
              soundFx.playTacticalClick();
              setHistory([]);
            }}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'var(--text-muted)',
              fontSize: '0.7rem',
              padding: '2px 8px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)'
            }}
          >
            Clear
          </button>
        </div>
      </div>

      {/* Suggested Command Pills */}
      <div style={{
        padding: '10px 16px',
        background: '#090e18',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          SUGGESTED QUERIES:
        </span>
        {TERMINAL_COMMANDS.map((tc, idx) => (
          <button
            key={idx}
            onClick={() => executeCommand(tc.cmd)}
            style={{
              background: 'rgba(0, 240, 255, 0.08)',
              border: '1px solid rgba(0, 240, 255, 0.2)',
              color: 'var(--cyan-primary)',
              padding: '3px 8px',
              borderRadius: '4px',
              fontSize: '0.72rem',
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)'
            }}
          >
            {tc.cmd.split('--')[0].trim()}...
          </button>
        ))}
      </div>

      {/* Console Log Area */}
      <div style={{
        padding: '18px 20px',
        height: '320px',
        overflowY: 'auto',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.82rem',
        lineHeight: 1.6
      }}>
        {history.map((item, idx) => {
          if (item.type === 'cmd') {
            return (
              <div key={idx} style={{ color: 'var(--cyan-primary)', marginTop: idx > 0 ? '12px' : 0 }}>
                <span style={{ color: '#ff2a5f', marginRight: '8px' }}>crimenet@intel-hq:~$</span>
                {item.text}
              </div>
            );
          }
          const isError = item.text.includes('[ERROR]');
          const isSuccess = item.text.includes('[SUCCESS]') || item.text.includes('[HIT FOUND]');
          const isInfo = item.text.includes('[INFO]') || item.text.includes('[SCAN]');

          return (
            <div
              key={idx}
              style={{
                color: isError ? '#ff2a5f' : isSuccess ? '#00ff9d' : isInfo ? '#00f0ff' : '#94a3b8',
                paddingLeft: '12px'
              }}
            >
              {item.text}
            </div>
          );
        })}
      </div>

      {/* Input Prompt */}
      <div style={{
        padding: '12px 18px',
        background: '#090e18',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <span style={{ color: '#ff2a5f', fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>
          crimenet@intel-hq:~$
        </span>
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type command (e.g. 'help', 'crimenet radar --sector Bravo') and press Enter..."
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: '#fff',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.82rem'
          }}
        />
        <button
          onClick={() => executeCommand(inputVal)}
          style={{
            background: 'var(--cyan-primary)',
            color: '#000',
            border: 'none',
            padding: '4px 12px',
            borderRadius: '4px',
            fontWeight: 700,
            fontSize: '0.75rem',
            cursor: 'pointer',
            fontFamily: 'var(--font-mono)'
          }}
        >
          EXECUTE
        </button>
      </div>
    </div>
  );
}
