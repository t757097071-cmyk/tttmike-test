import type { JingxinAudio } from "../../types/jingxin";

interface JingxinAudioCardProps {
  audio: JingxinAudio;
  isPlaying: boolean;
  onToggle: (audio: JingxinAudio) => void;
}

export function JingxinAudioCard({
  audio,
  isPlaying,
  onToggle,
}: JingxinAudioCardProps) {
  return (
    <article className={`jingxin-audio-card ${isPlaying ? "is-playing" : ""}`}>
      <div className="audio-symbol" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div>
        <span className="audio-tag">{audio.tag}</span>
        <h3>{audio.title}</h3>
        <p>{audio.description}</p>
      </div>
      <div className="audio-card-footer">
        <small>{audio.duration}</small>
        <button type="button" onClick={() => onToggle(audio)}>
          {isPlaying ? "暂停" : "播放"}
        </button>
      </div>
    </article>
  );
}
