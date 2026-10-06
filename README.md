# CYPHER - Sistema de Cibersegurança e Mitigação de Ameaças

## Visão Geral

O CYPHER é um ecossistema distribuído de cibersegurança projetado para monitorar ativos de rede, detectar anomalias, isolar ameaças em tempo real e validar a integridade de documentos digitais.

## Módulos do Sistema

- **CYPHERADM:** Módulo de gestão centralizada, exibição de dashboard e tomada de decisões.
- **CYPHERGuardian:** Módulo de segurança de rede focado em monitoramento de tráfego e isolamento lógico.
- **CYPHERAgent:** Serviço executado nos endpoints para coleta de telemetria e monitoramento local.
- **ValidadorDocumento:** Serviço especialista em análise de arquivos PDF e detecção de fraudes.

## Estrutura do Repositório

- `docs/`: Documentação técnica, requisitos, arquitetura e diagramas do projeto.
- `schemas/`: Contratos de comunicação e estruturas de dados compartilhadas.
- `services/`: Código-fonte dos módulos funcionais da solução.
