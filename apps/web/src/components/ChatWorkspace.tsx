import { Ban, Bell, BellOff, Flag, MessageCircle, MoreVertical, Send, X } from "lucide-react";
import { useState } from "react";
import IdentityBadge from "./IdentityBadge.js";

interface WorkspaceProps {
  conversationMessages: Array<{ id: string; sender_user_id: string; body: string }>;
  [key: string]: any;
}

export default function ChatWorkspace(props: WorkspaceProps) {
  const { activeConversation, conversationMessages, chatBusy, currentUser, reportedMessageIds, reportMessage, toggleConversationMute, toggleConversationBlock, sendChatMessage, chatDraft, setChatDraft, setActiveConversationId, openConversation } = props;
  const [showMore, setShowMore] = useState(false);

  return (
  <section
    className="chat-scrim"
    aria-label="چت داخل برنامه"
    role="presentation"
    onMouseDown={(event) => {
      if (event.target === event.currentTarget) setActiveConversationId("");
    }}
  >
    <article className="chat-drawer" role="dialog" aria-modal="true" aria-labelledby="chat-title">
      <div className="chat-header">
        <div>
          <span className="eyebrow">
            <MessageCircle size={16} />
            چت امن داخل 4D
          </span>
          <h2 id="chat-title">{activeConversation.content_title}</h2>
          <small className="chat-subtitle">گفتگوی امن داخل 4D</small>
        </div>
        <div className="chat-header-actions">
          <button type="button" className="icon-button" onClick={() => setShowMore((value) => !value)} aria-label="گزینه‌های گفتگو" aria-expanded={showMore}><MoreVertical size={18} /></button>
          <button type="button" className="icon-button" onClick={() => setActiveConversationId("")} aria-label="بستن چت"><X size={18} /></button>
        </div>
      </div>
      {activeConversation.participant ? <div className="chat-participant"><strong>{activeConversation.participant.display_name}</strong><span>{activeConversation.participant.city_name ?? "کاربر بازار 4D"}</span><IdentityBadge verified={activeConversation.participant.identity_verified} compact /></div> : null}
      <div className="chat-messages">
        {chatBusy && !conversationMessages.length ? (
          <span className="chat-empty">در حال دریافت پیام‌ها...</span>
        ) : conversationMessages.length ? (
          conversationMessages.map((message) => (
            <div
              className={message.sender_user_id === currentUser?.id ? "chat-bubble mine" : "chat-bubble"}
              key={message.id}
            >
              {isImageMessage(message.body) ? (
                <a href={message.body} target="_blank" rel="noreferrer" className="chat-image-link">
                  <img src={message.body} alt="تصویر ارسال‌شده در گفتگو" className="chat-image" />
                </a>
              ) : (
                <span>{message.body}</span>
              )}
              {message.sender_user_id !== currentUser?.id ? (
                <button
                  type="button"
                  className="message-report"
                  disabled={reportedMessageIds.includes(message.id)}
                  onClick={() => void reportMessage(message)}
                >
                  <Flag size={13} />
                  {reportedMessageIds.includes(message.id) ? "گزارش شد" : "گزارش"}
                </button>
              ) : null}
            </div>
          ))
        ) : (
          <span className="chat-empty">اولین پیام را بفرست؛ شماره هیچ‌کس عمومی نمی‌شود.</span>
        )}
      </div>
      {showMore ? <div className="chat-preferences">
        <button type="button" className="ghost-button" onClick={() => void toggleConversationMute(activeConversation)}>
          {activeConversation.is_muted ? <BellOff size={16} /> : <Bell size={16} />}
          {activeConversation.is_muted ? "فعال کردن اعلان این گفتگو" : "بی‌صدا کردن این گفتگو"}
        </button>
        <button type="button" className="ghost-danger" onClick={() => void toggleConversationBlock(activeConversation)}>
          <Ban size={16} />
          {activeConversation.is_blocked_by_me ? "برداشتن مسدودسازی" : "مسدود کردن گفتگو"}
        </button>
      </div> : null}
      <form className="chat-compose" onSubmit={(event) => void sendChatMessage(event)}>
        <input
          value={chatDraft}
          onChange={(event) => setChatDraft(event.target.value)}
          disabled={activeConversation.is_blocked}
          placeholder="پیام بنویس..."
        />
        <button type="submit" className="submit-button" disabled={chatBusy || activeConversation.is_blocked || !chatDraft.trim()}>
          <Send size={17} />
          ارسال
        </button>
      </form>
    </article>
  </section>
  );
}

function isImageMessage(value: string) {
  return value.startsWith("data:image/") || /^https?:\/\/[^\s]+\.(?:avif|gif|jpe?g|png|webp)(?:\?[^\s]*)?$/i.test(value);
}
