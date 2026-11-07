"""Add a Thai voiceover (macOS `say`, voice Kanya) to motion-graphic.mp4.

Usage: FFMPEG=/path/to/ffmpeg python3 presentation/add-voiceover.py
Reads voiceover.json (start/end in seconds, text) and writes motion-graphic-voiceover.mp4.
"""
import json
import os
import re
import subprocess
import sys
import tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
FFMPEG = os.environ.get("FFMPEG", "ffmpeg")
RATE = "195"  # words per minute for `say`
TAIL = 1.0  # seconds of frozen last frame so the closing line can finish


def duration(path):
    err = subprocess.run([FFMPEG, "-i", path], capture_output=True, text=True).stderr
    h, m, s = re.search(r"Duration: (\d+):(\d+):([\d.]+)", err).groups()
    return int(h) * 3600 + int(m) * 60 + float(s)


lines = json.load(open(os.path.join(HERE, "voiceover.json"), encoding="utf-8"))
tmp = tempfile.mkdtemp()
clips = []
for i, line in enumerate(lines):
    # Recorded lines (e.g. from ElevenLabs) in voice/line1.mp3 … voice/line9.mp3 take priority.
    recorded = [os.path.join(HERE, "voice", f"line{i + 1}.{ext}") for ext in ("mp3", "wav", "m4a")]
    src = next((p for p in recorded if os.path.exists(p)), None)
    if src is not None:
        # Recorded files carry leading/trailing silence; trim it so lines fit their scenes.
        out = os.path.join(tmp, f"line{i}.wav")
        trim = "silenceremove=start_periods=1:start_threshold=-45dB"
        subprocess.run(
            [FFMPEG, "-y", "-loglevel", "error", "-i", src, "-af", f"{trim},areverse,{trim},areverse", out],
            check=True,
        )
    else:
        out = os.path.join(tmp, f"line{i}.aiff")
        subprocess.run(["say", "-v", "Kanya", "-r", RATE, "-o", out, line["text"]], check=True)
    d = duration(out)
    if d > line["end"] - line["start"]:
        sys.exit(f"line {i} is {d:.2f}s but its window is {line['end'] - line['start']:.2f}s: shorten the text")
    clips.append(out)

inputs = ["-i", os.path.join(HERE, "motion-graphic.mp4")]
for c in clips:
    inputs += ["-i", c]
delays = ";".join(
    f"[{i + 1}:a]aresample=48000,adelay={int(line['start'] * 1000)}:all=1[a{i}]"
    for i, line in enumerate(lines)
)
mix = "".join(f"[a{i}]" for i in range(len(lines)))
graph = (
    f"[0:v]tpad=stop_mode=clone:stop_duration={TAIL}[v];{delays};"
    f"{mix}amix=inputs={len(lines)}:normalize=0,volume=1.6,apad[a]"
)
video = os.path.join(HERE, "motion-graphic.mp4")
total = duration(video) + TAIL
out = os.path.join(HERE, "motion-graphic-voiceover.mp4")
subprocess.run(
    [FFMPEG, "-y", "-loglevel", "error", *inputs, "-filter_complex", graph,
     "-map", "[v]", "-map", "[a]", "-c:v", "libx264", "-crf", "18", "-pix_fmt", "yuv420p",
     "-c:a", "aac", "-b:a", "160k", "-movflags", "+faststart", "-t", f"{total:.2f}", out],
    check=True,
)
print(f"wrote {out} ({duration(out):.1f}s)")
