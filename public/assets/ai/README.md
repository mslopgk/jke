# AI 생성 시안 이미지 — 실사진 교체 대상

이 폴더의 모든 이미지와 영상은 **Higgsfield로 생성한 AI 시안**입니다.
실제 JKE 제품·공장 사진이 아니며, 레이아웃과 톤을 확인하기 위한 자리표시자입니다.

**대외 공개 전 반드시 실사진으로 교체해야 합니다.** 교체 시 아래 파일명을
그대로 유지하면 코드 수정 없이 반영됩니다.

## 씬 배경 (1920px 내외 WebP)

| 파일 | 쓰이는 곳 | 필요한 실사진 |
|---|---|---|
| `hero-poster.webp` | 01 HERO 포스터 · 02 THRESHOLD 시작 프레임 | 야간 조선소 또는 자사 공장 외경 와이드컷 |
| `hero-loop.mp4` | 01 HERO 배경 루프 (768px 이상에서만 로드) | 8초 내외 무음 루프 영상 |
| `cabinet-macro.webp` | 02 THRESHOLD 도착 프레임 | 배전반 캐비닛 내부 결선 클로즈업 |
| `offshore.webp` | 03 SECTORS — OFFSHORE | 해양플랜트 납품 현장 또는 방폭 제품 |
| `shipbuilding.webp` | 03 SECTORS — SHIPBUILDING | 조선소 도크 또는 선박 전기실 |
| `building.webp` | 03 SECTORS — BUILDING | 육상 플랜트 수배전실 |
| `assembly.webp` | 예비 (현재 미사용) | 미음산단 공장 조립 라인 |
| `testing.webp` | 예비 (현재 미사용) | 시험 및 검사장비 |
| `texture.webp` | 예비 (현재 미사용) | — |

## 제품 컷 (1200px WebP, 4:3)

`p-switchboard` · `p-mcc` · `p-vfd` · `p-distribution` · `p-junctionbox`
· `p-console` · `p-booth` · `p-navlight` · `p-mas`

04 PRODUCTS 섹션에서 좌측 목록 순서대로 크로스페이드됩니다.
실제 제품 사진은 어두운 배경 · 측면 상단 키라이트로 촬영하면 현재 톤과 맞습니다.

## 재생성 방법

```bash
# 1. Higgsfield로 컷 생성 (--json 출력을 <이름>.json 으로 저장)
higgsfield generate create gpt_image_2 --prompt "..." --aspect_ratio 16:9 \
  --resolution 2k --wait --json > raw/offshore.json

# 2. 내려받아 WebP로 변환
node tools/build-assets.mjs raw

# 3. 영상은 별도로 재인코딩
node tools/build-video.mjs raw/hero-src.mp4
```
