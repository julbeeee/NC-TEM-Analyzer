# NC-TEM Analyzer v1.0.1 Release를 받은 뒤 시작하기

이 프로그램은 **내 컴퓨터에서 실행하고 웹 브라우저로 사용하는 TEM 이미지 분석 도구**입니다. GitHub에서 파일을 내려받은 다음 Python으로 분석 서버를 실행해야 합니다.

현재 v1.0.1 Release에는 별도 설치 프로그램이나 `.exe`가 없고 소스코드 압축 파일이 제공됩니다. 아래는 해당 Release의 `Source code (zip)`을 받은 사용자 기준 안내입니다.

## 1. 준비 및 다운로드

- Python 3.10 이상과 웹 브라우저가 필요합니다.
- Python이 없다면 Python 공식 홈페이지에서 설치합니다. Windows 설치 과정에 `Add python.exe to PATH` 옵션이 있으면 선택하고, 설치 후 터미널을 다시 엽니다.
- 최초 패키지 설치에는 인터넷 연결이 필요합니다. Git이나 Node.js는 일반적인 실행에 필요하지 않습니다.
- [v1.0.1 Release 페이지](https://github.com/julbeeee/NC-TEM-Analyzer/releases/tag/v1.0.1) 아래쪽 **Assets**에서 **Source code (zip)**을 누릅니다. `Source code (tar.gz)`는 선택하지 않아도 됩니다.
- 받은 ZIP 파일을 마우스 오른쪽 버튼으로 눌러 **모두 추출**합니다(Windows 기준). 이미 받았다면 이 단계부터 진행합니다.

압축을 푼 폴더 안의 `NC-TEM-Analyzer-1.0.1` 폴더를 엽니다. **`requirements.txt`, `backend`, `frontend`가 함께 보이는 위치**가 맞습니다. ZIP 파일 내부에서 바로 실행하지 마세요.

## 2. 최초 설치

### Windows

파일 탐색기에서 위 폴더를 열고, 주소창에 `powershell`을 입력한 뒤 Enter를 누릅니다. 열린 창에 아래 명령을 **한 줄씩** 입력합니다.

```powershell
python --version
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install --upgrade pip
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

첫 줄에 Python 3.10 이상의 버전이 표시되는지 확인합니다. 설치 도중 오류가 나면 아래 문제 해결을 확인한 후 계속 진행하세요. `.venv`는 이 프로그램에 필요한 패키지를 따로 설치하는 폴더입니다. 별도로 활성화할 필요는 없습니다.

### macOS / Linux

터미널에서 압축을 푼 프로젝트 폴더로 이동한 후 실행합니다. 아래 예시의 경로는 실제 폴더 경로로 바꿉니다.

```bash
cd "/path/to/NC-TEM-Analyzer"
python3 --version
python3 -m venv .venv
./.venv/bin/python -m pip install --upgrade pip
./.venv/bin/python -m pip install -r requirements.txt
```

## 3. 프로그램 실행

같은 폴더의 터미널에서 실행합니다.

**Windows:**

```powershell
.\.venv\Scripts\python.exe backend/web_app.py
```

**macOS / Linux:**

```bash
./.venv/bin/python backend/web_app.py
```

터미널에 `Running on http://127.0.0.1:8000`이 표시되면 브라우저 주소창에 **http://127.0.0.1:8000**을 입력합니다. 분석 화면이 열리면 준비가 끝났습니다. 이 주소는 프로그램을 실행한 컴퓨터에서 접속하는 주소입니다.

사용하는 동안 터미널 창을 켜 둡니다. GitHub 페이지를 열거나 `frontend/tem.html` 파일만 더블클릭하는 것으로는 분석 서버가 실행되지 않습니다.

## 4. 샘플로 첫 분석하기

1. 분석 화면에서 프로젝트의 `sample_data/spherical_ag2se.jpg`를 업로드합니다.
2. 분석 모드를 **Spherical dot**으로 선택합니다.
3. 스케일바 길이를 **50 nm**, 색상을 **black**으로 설정합니다.
4. **Run Auto-Detect**를 누릅니다.
5. 이미지 위의 검출 표시와 크기 분포 히스토그램을 확인합니다.
6. 잘못 검출된 입자를 제외하고, 필요한 입자의 크기나 위치를 수동 보정합니다.
7. 필요한 결과를 **CSV**로 내보내거나 히스토그램을 **PNG**로 저장합니다.

검출 개수와 통계는 설정 및 수동 보정에 따라 달라질 수 있습니다. 자신의 이미지를 분석할 때는 해당 이미지에 표시된 실제 스케일바 길이와 색상을 입력합니다. 나노플레이트나 막대형 입자는 **Nanoplatelet / Rod** 모드를 사용합니다.

샘플 상세 설명 및 출처는 [샘플 안내](sample_data/README.md)를 참고하세요.

## 5. 종료하고 다음에 다시 실행하기

필요한 결과를 먼저 내보낸 다음, 서버가 실행 중인 터미널에서 **Ctrl+C**를 눌러 종료합니다.

다음 사용 시에는 같은 프로젝트 폴더에서 터미널을 열고 **3번의 실행 명령만 다시 입력**한 후 브라우저로 접속하면 됩니다. 최초 설치 명령을 매번 실행할 필요는 없습니다.

## 문제가 생겼을 때

| 증상 | 해결 방법 |
| --- | --- |
| `python` 명령을 찾을 수 없음 | Python 설치 후 터미널을 다시 엽니다. Windows에서 `py --version`이 동작하면 가상환경 생성 명령을 `py -m venv .venv`로 실행할 수 있습니다. |
| `requirements.txt` 또는 `backend/web_app.py`를 찾을 수 없음 | 현재 터미널이 해당 파일이 있는 프로젝트 폴더에서 열렸는지 확인합니다. |
| `ModuleNotFoundError` 표시 | 2번의 패키지 설치를 다시 실행하고, 3번처럼 `.venv` 안의 Python으로 서버를 실행합니다. |
| 브라우저에서 사이트에 연결할 수 없음 | 서버 터미널의 오류 여부와 실행 상태를 확인하고 주소를 `http://127.0.0.1:8000`으로 입력합니다. |
| 8000 포트가 이미 사용 중이라는 오류 | 이전에 실행한 분석 서버의 터미널에서 Ctrl+C로 종료한 뒤 다시 실행합니다. |
| Linux에서 `venv` 또는 `ensurepip` 관련 오류 | 사용 중인 배포판의 Python venv 패키지를 설치하고 가상환경 생성을 다시 진행합니다. |

해결되지 않으면 사용 중인 운영체제, Python 버전, 실행한 명령과 터미널의 오류 메시지를 함께 전달해 주세요.
