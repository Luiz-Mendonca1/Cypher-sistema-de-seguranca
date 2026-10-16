# CYPHERAgent

## Descrição
Módulo de agente local executado em segundo plano nas máquinas clientes (hosts). É responsável pelo monitoramento de recursos locais, verificação de integridade de arquivos-isca e notificação imediata de ameaças.

## Requisitos Funcionais (RF)
* **RF08 - Monitoramento de Processos e Telemetria:** Coletar e enviar periodicamente dados de consumo de CPU, memória, processos ativos e tráfego de rede do host.
* **RF09 - Verificação de Arquivos Armadilha (Honeyfiles):** Monitorar arquivos isca para detectar acessos ou modificações não autorizadas (indicativo de ransomware).
* **RF10 - Emissão de Alertas Emergenciais:** Notificar o painel central imediatamente ao identificar uma ameaça crítica local.

## Integração CYPHERADM

O agente envia telemetria para `http://localhost:3000/api/telemetry` a cada 5 segundos e notifica `/api/alerts` quando um honeyfile é alterado ou removido. O backend deve estar acessível nessa máquina na porta 3000.

`src/pdf_validator.py` disponibiliza `validate_boleto_pdf(pdf_path)`, que retorna o resultado da extração e validação da linha digitável bancária. A validação usa texto extraível do PDF e não faz OCR de documentos digitalizados como imagem.