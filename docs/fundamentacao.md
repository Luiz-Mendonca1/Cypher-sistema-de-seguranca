## 1. Contexto do Problema e Justificativa

- **O Cenário Atual de Ameaças:** Explicar o aumento exponencial de ataques de _Ransomware_, engenharia social e fraudes financeiras com boletos falsos no ambiente corporativo.
- **O Problema da Resposta Lenta:** Destacar que o tempo médio para conter uma ameaça manualmente (dependendo de analistas de SOC) é muito alto, permitindo que o ataque se espalhe pela rede local.
- **A Solução CYPHER:** Justificar a necessidade de uma resposta **automatizada** e **descentralizada**, unindo proteção no host (EDR), na rede (NDR) e na camada de aplicação (validação antifraude).

---

## 2. Embasamento Teórico e Conceitos-Chave

Definir sucintamente os conceitos de segurança que sustentam a arquitetura do projeto:

- **Arquitetura Zero Trust (Confiança Zero):** O princípio de "nunca confiar, sempre verificar", tratando todos os dispositivos da rede como potencialmente comprometidos até prova em contrário.
- **Técnica de _Honeyfiles_ (Deception Technology):** Uso de arquivos-isca estratégicos para detectar acessos/criptografia não autorizados em estágios iniciais de um ataque.
- **Isolamento de Rede via 802.1Q (VLAN de Quarentena):** Mecanismo padrão da IEEE para segregação lógica de tráfego de dispositivos em estado suscetível ou infectado.
- **Forense Computacional e Rastreabilidade:** Importância do registro imutável de eventos e telemetria para auditorias pós-incidente e conformidade normativa.

---

## 3. Matriz de Alinhamento com Normas e Regulamentações

Mostrar que o CYPHER atende a exigências legais e de boas práticas de mercado:

| Norma / Padrão    | Requisito Relacionado             | Como o CYPHER Atende                                                                                  |
| ----------------- | --------------------------------- | ----------------------------------------------------------------------------------------------------- |
| **LGPD / GDPR**   | Proteção e Segurança de Dados     | Registro de auditoria, controle de acesso restrito e proteção contra vazamento de dados corporativos. |
| **ISO/IEC 27001** | Gestão de Incidentes de Segurança | Detecção automatizada, contenção em tempo real (VLAN) e geração de relatórios formais.                |
| **MITRE ATT&CK**  | Mapeamento de Táticas e Técnicas  | Mitigação de técnicas de execução e impacto de Ransomware (T1486) via _Honeyfiles_.                   |

---

## 4. Diferenciais da Abordagem CYPHER

- **Sinergia Multi-Camada:** Destaque para o fato de o sistema não atuar apenas na rede ou apenas no dispositivo, mas sim na integração em tempo real entre **Host + Rede + Documentos**.
- **Mitigação Ativa vs. Passiva:** Sistemas tradicionais apenas alertam o operador; o CYPHER executa ação direta de contenção (quarentena imediata) para barrar a movimentação lateral de ameaças.
