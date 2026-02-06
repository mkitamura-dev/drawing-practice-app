import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import "./App.css";

type ViewMode = "challenge" | "practice";
type TopicSource = "today" | "random";

type Submission = {
  id: number;
  prompt: string;
  prompt_type: TopicSource;
  time_limit_seconds: number;
  image_url: string;
  created_at: string;
};

const TOPICS = ["りんご", "猫", "自転車", "カップ", "木", "家", "雲", "靴", "椅子", "花", "魚", "時計"];

const REFERENCE_IMAGES = [
  {
    id: "cat",
    title: "猫のポーズ",
    url: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "bike",
    title: "自転車",
    url: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "flower",
    title: "花",
    url: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "city",
    title: "街並み",
    url: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=1200&q=80",
  },
];

const TIMER_PRESETS = [
  { label: "1分", seconds: 60 },
  { label: "3分", seconds: 180 },
  { label: "5分", seconds: 300 },
];

function formatTimer(seconds: number): string {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

function getTodayTopic(): string {
  const now = new Date();
  const seed = Number(`${now.getFullYear()}${now.getMonth() + 1}${now.getDate()}`);
  return TOPICS[seed % TOPICS.length];
}

function formatDate(value: string): string {
  const date = new Date(value);
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes(),
  ).padStart(2, "0")}`;
}

function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mode, setMode] = useState<ViewMode>("challenge");
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(4);
  const [strokeColor, setStrokeColor] = useState("#111827");
  const [selectedTopic, setSelectedTopic] = useState(getTodayTopic());
  const [topicSource, setTopicSource] = useState<TopicSource>("today");
  const [selectedPreset, setSelectedPreset] = useState(TIMER_PRESETS[1].seconds);
  const [remainingSeconds, setRemainingSeconds] = useState(TIMER_PRESETS[1].seconds);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedImageId, setSelectedImageId] = useState(REFERENCE_IMAGES[0].id);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiMessage, setApiMessage] = useState("");

  const selectedImage = useMemo(
    () => REFERENCE_IMAGES.find((image) => image.id === selectedImageId) ?? REFERENCE_IMAGES[0],
    [selectedImageId],
  );

  useEffect(() => {
    setRemainingSeconds(selectedPreset);
    setIsRunning(false);
  }, [selectedPreset]);

  useEffect(() => {
    if (!isRunning || remainingSeconds <= 0) {
      if (remainingSeconds <= 0) setIsRunning(false);
      return;
    }

    const timerId = window.setInterval(() => {
      setRemainingSeconds((previous) => {
        if (previous <= 1) {
          window.clearInterval(timerId);
          return 0;
        }
        return previous - 1;
      });
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [isRunning, remainingSeconds]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.lineCap = "round";
    context.lineJoin = "round";
  }, []);

  const fetchSubmissions = async (): Promise<void> => {
    setIsLoadingSubmissions(true);
    try {
      const response = await fetch("/api/drawings?limit=12");
      if (!response.ok) throw new Error("投稿一覧の取得に失敗しました。");
      const payload = (await response.json()) as { data: Submission[] };
      setSubmissions(payload.data);
    } catch (error) {
      setApiMessage(error instanceof Error ? error.message : "投稿一覧の取得に失敗しました。");
    } finally {
      setIsLoadingSubmissions(false);
    }
  };

  useEffect(() => {
    void fetchSubmissions();
  }, []);

  const toCanvasPoint = (event: ReactPointerEvent<HTMLCanvasElement>): { x: number; y: number } | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const bounds = canvas.getBoundingClientRect();
    const scaleX = canvas.width / bounds.width;
    const scaleY = canvas.height / bounds.height;

    return {
      x: (event.clientX - bounds.left) * scaleX,
      y: (event.clientY - bounds.top) * scaleY,
    };
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLCanvasElement>): void => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    const point = toCanvasPoint(event);
    if (!context || !point) return;

    canvas.setPointerCapture(event.pointerId);
    context.strokeStyle = strokeColor;
    context.lineWidth = brushSize;
    context.beginPath();
    context.moveTo(point.x, point.y);
    setIsDrawing(true);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLCanvasElement>): void => {
    if (!isDrawing) return;
    const context = canvasRef.current?.getContext("2d");
    const point = toCanvasPoint(event);
    if (!context || !point) return;

    context.lineTo(point.x, point.y);
    context.stroke();
  };

  const handlePointerUp = (): void => {
    const context = canvasRef.current?.getContext("2d");
    if (!context) return;
    context.closePath();
    setIsDrawing(false);
  };

  const clearCanvas = (): void => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
  };

  const canvasToBlob = async (): Promise<Blob> => {
    const canvas = canvasRef.current;
    if (!canvas) {
      throw new Error("キャンバスが見つかりません。");
    }

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("画像データの変換に失敗しました。"));
          return;
        }
        resolve(blob);
      }, "image/png");
    });
  };

  const submitDrawing = async (): Promise<void> => {
    setIsSubmitting(true);
    setApiMessage("");
    try {
      const imageBlob = await canvasToBlob();
      const formData = new FormData();
      formData.append("prompt", selectedTopic);
      formData.append("prompt_type", topicSource);
      formData.append("time_limit_seconds", String(selectedPreset));
      formData.append("image", imageBlob, `drawing-${Date.now()}.png`);

      const response = await fetch("/api/drawings", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error("投稿に失敗しました。");
      }

      setApiMessage("投稿しました。");
      await fetchSubmissions();
    } catch (error) {
      setApiMessage(error instanceof Error ? error.message : "投稿に失敗しました。");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="page">
      <div className="container">
        <header className="header-card">
          <p className="eyebrow">Drawing Practice</p>
          <h1 className="page-title">お絵描きトレーニング</h1>
          <div className="tab-list">
            <button
              type="button"
              onClick={() => setMode("challenge")}
              className={`tab-button ${mode === "challenge" ? "tab-button--active" : ""}`}
            >
              お題チャレンジ
            </button>
            <button
              type="button"
              onClick={() => setMode("practice")}
              className={`tab-button ${mode === "practice" ? "tab-button--active" : ""}`}
            >
              画像練習
            </button>
          </div>
        </header>

        {mode === "challenge" ? (
          <section className="content-grid challenge-grid">
            <div className="panel-stack">
              <article className="panel">
                <p className="panel-label">お題</p>
                <p className="topic-text">{selectedTopic}</p>
                <div className="button-row">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTopic(TOPICS[Math.floor(Math.random() * TOPICS.length)]);
                      setTopicSource("random");
                    }}
                    className="button button--dark"
                  >
                    ランダムお題
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTopic(getTodayTopic());
                      setTopicSource("today");
                    }}
                    className="button button--primary"
                  >
                    今日のお題
                  </button>
                </div>
              </article>

              <article className="panel">
                <p className="panel-label">タイマー</p>
                <p className={`timer-text ${remainingSeconds === 0 ? "timer-text--danger" : ""}`}>{formatTimer(remainingSeconds)}</p>
                <div className="button-row">
                  {TIMER_PRESETS.map((preset) => (
                    <button
                      key={preset.seconds}
                      type="button"
                      onClick={() => setSelectedPreset(preset.seconds)}
                      className={`button ${selectedPreset === preset.seconds ? "button--primary" : "button--ghost"}`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
                <div className="button-row">
                  <button
                    type="button"
                    onClick={() => {
                      if (remainingSeconds === 0) setRemainingSeconds(selectedPreset);
                      setIsRunning(true);
                    }}
                    className="button button--success"
                  >
                    開始
                  </button>
                  <button type="button" onClick={() => setIsRunning(false)} className="button button--dark">
                    一時停止
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsRunning(false);
                      setRemainingSeconds(selectedPreset);
                    }}
                    className="button button--ghost"
                  >
                    リセット
                  </button>
                </div>
              </article>

              <article className="panel">
                <p className="panel-label">ブラシ設定</p>
                <label className="field-label">
                  太さ: {brushSize}
                  <input
                    type="range"
                    min={1}
                    max={16}
                    value={brushSize}
                    onChange={(event) => setBrushSize(Number(event.target.value))}
                    className="range-input"
                  />
                </label>
                <label className="field-label">
                  色
                  <input
                    type="color"
                    value={strokeColor}
                    onChange={(event) => setStrokeColor(event.target.value)}
                    className="color-input"
                  />
                </label>
              </article>
            </div>

            <article className="panel canvas-panel">
              <div className="canvas-header">
                <p className="canvas-topic">お題: {selectedTopic}</p>
                <button type="button" onClick={clearCanvas} className="button button--ghost">
                  キャンバスを消す
                </button>
                <button type="button" onClick={() => void submitDrawing()} className="button button--primary" disabled={isSubmitting}>
                  {isSubmitting ? "投稿中..." : "投稿する"}
                </button>
              </div>
              <canvas
                ref={canvasRef}
                width={1200}
                height={800}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
                className="drawing-canvas"
              />
              {apiMessage ? <p className="api-message">{apiMessage}</p> : null}
              <div className="submission-head">
                <p className="panel-title">投稿一覧</p>
                <button type="button" onClick={() => void fetchSubmissions()} className="button button--ghost" disabled={isLoadingSubmissions}>
                  更新
                </button>
              </div>
              {isLoadingSubmissions ? <p className="muted">読み込み中...</p> : null}
              {!isLoadingSubmissions && submissions.length === 0 ? <p className="muted">投稿はまだありません。</p> : null}
              <div className="submission-grid">
                {submissions.map((submission) => (
                  <article key={submission.id} className="submission-card">
                    <img src={submission.image_url} alt={submission.prompt} className="submission-image" />
                    <div className="submission-body">
                      <p className="submission-prompt">{submission.prompt}</p>
                      <p className="submission-meta">
                        {submission.prompt_type === "today" ? "今日のお題" : "ランダム"} / {formatTimer(submission.time_limit_seconds)}
                      </p>
                      <p className="submission-meta">{formatDate(submission.created_at)}</p>
                    </div>
                  </article>
                ))}
              </div>
            </article>
          </section>
        ) : (
          <section className="content-grid practice-grid">
            <aside className="panel">
              <p className="panel-title">練習用画像</p>
              <div className="image-list">
                {REFERENCE_IMAGES.map((image) => (
                  <button
                    key={image.id}
                    type="button"
                    onClick={() => setSelectedImageId(image.id)}
                    className={`image-item ${selectedImageId === image.id ? "image-item--active" : ""}`}
                  >
                    <img src={image.url} alt={image.title} className="image-thumb" />
                    <p className="image-caption">{image.title}</p>
                  </button>
                ))}
              </div>
            </aside>

            <article className="panel preview-panel">
              <p className="panel-label">表示中の画像</p>
              <h2 className="panel-heading">{selectedImage.title}</h2>
              <p className="panel-description">画像を見ながら、形・比率・明暗を意識してスケッチしてください。</p>
              <img src={selectedImage.url} alt={selectedImage.title} className="preview-image" />
            </article>
          </section>
        )}
      </div>
    </main>
  );
}

export default App;
