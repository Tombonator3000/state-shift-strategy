"""Generate procedural paranormal SFX and emit TypeScript data URLs."""
import base64
import io
import json
import math
import random
import struct
import wave
from pathlib import Path

SAMPLE_RATE = 44_100
PREFIX = "data:audio/wav;base64,"
CHUNK = 96


def encode_wave(samples: list[float]) -> str:
    buffer = io.BytesIO()
    with wave.open(buffer, "wb") as wav_file:
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)
        wav_file.setframerate(SAMPLE_RATE)
        frames = bytearray()
        for sample in samples:
            clamped = max(-1.0, min(1.0, sample))
            frames.extend(struct.pack("<h", int(clamped * 32767)))
        wav_file.writeframes(frames)
    return base64.b64encode(buffer.getvalue()).decode("ascii")


def generate_ufo_elvis(duration: float = 1.8) -> list[float]:
    total_samples = int(duration * SAMPLE_RATE)
    samples: list[float] = []
    for n in range(total_samples):
        t = n / SAMPLE_RATE
        envelope = math.exp(-2 * t)
        carrier = math.sin(2 * math.pi * 780 * t)
        harmonic = 0.5 * math.sin(2 * math.pi * 1_560 * t + 0.5 * math.sin(2 * math.pi * 6 * t))
        vibrato = math.sin(2 * math.pi * (920 + 30 * math.sin(2 * math.pi * 5 * t)) * t)
        samples.append((carrier + harmonic + 0.3 * vibrato) * envelope)
    return samples


def generate_cryptid_rumble(duration: float = 2.4) -> list[float]:
    total_samples = int(duration * SAMPLE_RATE)
    samples: list[float] = []
    for n in range(total_samples):
        t = n / SAMPLE_RATE
        envelope = min(1.0, t / 0.4) * math.exp(-1.2 * max(0.0, t - 0.8))
        low = math.sin(2 * math.pi * 52 * t)
        sub = 0.6 * math.sin(2 * math.pi * 32 * t + 0.3 * math.sin(2 * math.pi * 0.7 * t))
        noise = (random.random() * 2 - 1) * 0.3
        samples.append((low + sub + noise) * envelope)
    return samples


def generate_radio_static(duration: float = 1.5) -> list[float]:
    total_samples = int(duration * SAMPLE_RATE)
    samples: list[float] = []
    for n in range(total_samples):
        t = n / SAMPLE_RATE
        envelope = min(1.0, t / 0.05) * (0.7 + 0.3 * math.sin(2 * math.pi * 18 * t))
        noise = (random.random() * 2 - 1)
        crackle = 0.0
        if random.random() < 0.006:
            crackle = (random.random() * 2 - 1) * 0.7
        samples.append((noise * 0.35 + crackle * 0.2) * envelope)
    return samples


def format_constant(name: str, data: str) -> str:
    chunks = [data[i : i + CHUNK] for i in range(0, len(data), CHUNK)]
    parts = "'\n  + '".join(chunks)
    return f"export const {name} = '{PREFIX}'\n  + '{parts}' as const;"


def main() -> None:
    payload = {
        "UFO_ELVIS_SFX": encode_wave(generate_ufo_elvis()),
        "CRYPTID_RUMBLE_SFX": encode_wave(generate_cryptid_rumble()),
        "RADIO_STATIC_SFX": encode_wave(generate_radio_static()),
    }
    banner = "// Auto-generated procedural paranormal SFX data URLs.\n" \
             "// Run tools/generate_paranormal_sfx.py to refresh these assets.\n"
    body = "\n\n".join(format_constant(name, data) for name, data in payload.items())
    Path("src/assets/audio/paranormalSfx.ts").write_text(banner + body + "\n")
    manifest = {
        "ufo-elvis": "Procedural AM broadcast sting with vibrato sweep.",
        "cryptid-rumble": "Low-end subterranean movement with noise textures.",
        "radio-static": "Noisy detuned static with sporadic crackle.",
    }
    Path("public/audio/paranormal-sfx.json").write_text(json.dumps(manifest, indent=2))


if __name__ == "__main__":
    main()
