'use client';

import React, { useState, useEffect } from 'react';
import { BaseNodeCard } from './BaseNodeCard';
import { NodeProps } from '@xyflow/react';
import { NodeData } from '../../../../../packages/shared-types';
import { Send, ShieldCheck, RefreshCw, CheckCircle2, AlertCircle, Sparkles, MessageCircle, Radio } from 'lucide-react';

export const TelegramTriggerNode: React.FC<NodeProps> = (props) => {
  const data = props.data as unknown as NodeData;
  const config = data.config || {};

  const [botUsername, setBotUsername] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isAutoDetecting, setIsAutoDetecting] = useState(false);
  const [detectedChatId, setDetectedChatId] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // Background Auto-Responder Polling State
  const [isLivePolling, setIsLivePolling] = useState(true);
  const [lastUpdateId, setLastUpdateId] = useState<number>(0);

  const hasRealToken = config.bot_token && config.bot_token.includes(':') && !config.bot_token.includes('demo');

  // Step 1: Verify Bot Token with getMe on mount or token change
  useEffect(() => {
    if (hasRealToken) {
      setIsVerifying(true);
      fetch(`/api/webhooks/telegram/poll?token=${encodeURIComponent(config.bot_token)}`)
        .then((res) => res.json())
        .then((json) => {
          if (json.ok) {
            setBotUsername(json.botUsername);
          } else {
            setBotUsername(null);
          }
        })
        .catch(() => setBotUsername(null))
        .finally(() => setIsVerifying(false));
    }
  }, [config.bot_token, hasRealToken]);

  // Step 2: Continuous Background Polling Loop for Hands-Free Auto-Responding
  useEffect(() => {
    if (!hasRealToken || !isLivePolling) return;

    let isSubscribed = true;

    const pollTelegramUpdates = async () => {
      try {
        const offsetParam = lastUpdateId > 0 ? `&offset=${lastUpdateId + 1}` : '';
        const res = await fetch(`https://api.telegram.org/bot${config.bot_token}/getUpdates?limit=5${offsetParam}`);
        const json = await res.json();

        if (isSubscribed && json.ok && json.result?.length > 0) {
          for (const update of json.result) {
            if (update.update_id > lastUpdateId) {
              setLastUpdateId(update.update_id);

              if (update.message?.text && update.message?.chat?.id) {
                const incomingChatId = String(update.message.chat.id);
                setDetectedChatId(incomingChatId);

                // Auto-execute workflow through Telegram Webhook endpoint
                await fetch('/api/webhooks/telegram', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    bot_token: config.bot_token,
                    message: update.message,
                  }),
                });

                setStatusMsg(`⚡ Auto-responded to @${update.message.from?.first_name || 'user'}: "${update.message.text.slice(0, 18)}..."`);
              }
            }
          }
        }
      } catch (err) {
        // Silent poll error catch
      }
    };

    const interval = setInterval(pollTelegramUpdates, 3000);
    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
  }, [config.bot_token, hasRealToken, isLivePolling, lastUpdateId]);

  const handleAutoDetectAndSendTest = async () => {
    if (!hasRealToken) {
      alert('Please enter a valid Telegram Bot Token from @BotFather in the right Inspector panel.');
      return;
    }

    setIsAutoDetecting(true);
    setStatusMsg(null);

    try {
      const res = await fetch('/api/webhooks/telegram/poll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bot_token: config.bot_token,
          chat_id: detectedChatId,
          test_message: 'Testing Telegram bot connection from HF Workflow canvas!',
        }),
      });

      const json = await res.json();
      if (json.ok) {
        setDetectedChatId(String(json.detectedChatId));
        setStatusMsg(`Delivered to Chat ID: ${json.detectedChatId}`);
      } else {
        setStatusMsg(json.error || 'Failed to send');
      }
    } catch (e: any) {
      setStatusMsg(e.message || 'Connection error');
    } finally {
      setIsAutoDetecting(false);
    }
  };

  return (
    <BaseNodeCard id={props.id} selected={props.selected} data={data}>
      <div className="space-y-2 text-[11px]">
        {/* Status Badge */}
        <div className="flex items-center justify-between bg-slate-900/80 p-2 rounded-lg border border-slate-800">
          <span className="text-slate-400 font-mono">Bot Handle:</span>
          <span className={`font-semibold flex items-center gap-1 ${hasRealToken ? 'text-emerald-400' : 'text-amber-400'}`}>
            <ShieldCheck className="w-3.5 h-3.5" />
            {isVerifying ? (
              <RefreshCw className="w-3 h-3 animate-spin text-slate-400" />
            ) : botUsername ? (
              <span className="text-emerald-400 font-bold">{botUsername}</span>
            ) : hasRealToken ? (
              'Token Set'
            ) : (
              'Demo Token'
            )}
          </span>
        </div>

        {/* Live Auto-Responder Indicator Pill */}
        {hasRealToken && (
          <div className="flex items-center justify-between bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/30 text-[10px] font-bold text-emerald-400">
            <span className="flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
              <span>Live Auto-Responder Active</span>
            </span>
            <button
              onClick={() => setIsLivePolling(!isLivePolling)}
              className="text-[9px] underline text-emerald-300 hover:text-white"
            >
              {isLivePolling ? 'Pause' : 'Resume'}
            </button>
          </div>
        )}

        {/* Configuration snippet */}
        <div className="bg-slate-900/40 p-2 rounded-lg border border-slate-800/60 font-mono text-[10px] space-y-1">
          <div className="text-slate-400">Token: <span className="text-slate-200">{config.bot_token ? `••••${config.bot_token.slice(-4)}` : 'Not set'}</span></div>
          <div className="text-slate-400">Chat ID: <span className="text-cyan-300">{detectedChatId || 'Auto-detecting...'}</span></div>
        </div>

        {/* Auto Detect & Test Button */}
        <button
          onClick={handleAutoDetectAndSendTest}
          disabled={isAutoDetecting}
          className="w-full py-1.5 px-2 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 shadow-md shadow-sky-600/20 transition-all disabled:opacity-50"
        >
          {isAutoDetecting ? (
            <RefreshCw className="w-3 h-3 animate-spin text-white" />
          ) : (
            <Send className="w-3 h-3 text-white" />
          )}
          <span>{isAutoDetecting ? 'Detecting Chat ID...' : 'Send Test Message to Telegram'}</span>
        </button>

        {statusMsg && (
          <div className={`p-2 rounded-lg font-mono text-[10px] leading-tight ${
            statusMsg.includes('Delivered') || statusMsg.includes('Auto-responded')
              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
              : 'bg-amber-500/10 border border-amber-500/20 text-amber-300'
          }`}>
            {statusMsg}
          </div>
        )}
      </div>
    </BaseNodeCard>
  );
};
