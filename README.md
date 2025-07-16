# 데이터 맵 웹사이트

## 1. 개요

이 프로젝트는 회사 데이터 웨어하우스의 최신 상태를 시각화하는 데이터 맵 웹사이트입니다. 이 웹사이트는 회사 내 데이터의 현재 상태에 대한 단일 정보 소스가 되는 것을 목표로 합니다. 보안상의 이유로 데이터베이스에 접근할 수 있는 직원이 제한되어 있기 때문에, 이 웹사이트는 데이터베이스의 내용을 더 읽기 쉽고 이해하기 쉬운 형태로 제공하여 기술이나 데이터에 익숙하지 않은 사람들도 쉽게 접근할 수 있도록 합니다.

<br/><br/>


## 2. 실행 방법
이 애플리케이션은 Docker Compose를 사용하여 쉽게 실행할 수 있습니다.

### 전제 조건

-   Docker Desktop이 설치되어 있어야 합니다.
-   PostgreSQL 데이터베이스에 접근할 수 있어야 합니다. (백엔드는 AWS RDS의 PostgreSQL DB에 연결됩니다.)
-   회사 네트워크 환경에서 SSL 인증서 문제가 발생할 경우, `frontend` 서비스의 `volumes` 및 `environment` 섹션에 다음 줄을 추가하여 Zscaler 루트 인증서를 마운트해야 합니다.
    ```yaml
          - /${path_to_zscaler_root_cert}/ZscalerRootCertificate-2048-SHA256.crt:/usr/local/share/ca-certificates/zscaler.crt
        environment:
          - NODE_EXTRA_CA_CERTS=/usr/local/share/ca-certificates/zscaler.crt
    ```
    (위 경로는 사용자 환경에 맞게 조정해야 합니다.)

### 애플리케이션 실행

1.  프로젝트 루트 디렉토리로 이동합니다:
    ```bash
    cd /workspace/data-map
    ```
2.  Docker Compose를 사용하여 애플리케이션을 빌드하고 실행합니다:
    ```bash
    docker-compose up -d --build
    ```
    이 명령어는 백엔드와 프런트엔드 서비스를 빌드하고 백그라운드에서 실행합니다.

3.  컨테이너 상태 확인:
    ```bash
    docker-compose ps
    ```
    모든 서비스가 `Up` 상태인지 확인합니다.

4.  애플리케이션 접근:
    프런트엔드는 `http://localhost:3000`에서 접근할 수 있습니다.

### 애플리케이션 중지

애플리케이션을 중지하려면 다음 명령어를 실행합니다:
```bash
docker-compose down
```



## 3. 진행 상황

-   **프로젝트 설정**: Next.js 프런트엔드와 FastAPI 백엔드로 구성된 모노레포를 생성했습니다.
-   **데이터베이스 연결**: 백엔드가 PostgreSQL 데이터베이스에 성공적으로 연결됩니다.
-   **핵심 기능**: `out_gov` 스키마의 테이블을 표시하는 페이지를 구현했습니다.
-   **테이블 상세 페이지**: 설명 및 샘플 데이터를 포함한 상세 컬럼 정보를 보여주는 동적 페이지를 생성했습니다.
-   **UX 개선**:
    -   데이터 가져오기 중 더 나은 피드백을 제공하기 위해 로딩 스켈레톤을 추가했습니다.
    -   행 수가 0인 현상에 대한 한국어 설명을 추가했습니다.
-   **도커화**: 일관된 개발 환경을 위해 `docker-compose`를 사용하여 전체 애플리케이션 스택(프런트엔드 및 백엔드)을 도커화했습니다.
