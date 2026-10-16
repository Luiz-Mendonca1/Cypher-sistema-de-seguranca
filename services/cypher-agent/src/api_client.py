import requests


API_BASE_URL = 'http://localhost:3000/api'
REQUEST_TIMEOUT_SECONDS = 5


def post_json(endpoint, payload):
    response = requests.post(
        f'{API_BASE_URL}/{endpoint}',
        json=payload,
        timeout=REQUEST_TIMEOUT_SECONDS
    )
    response.raise_for_status()
    result = response.json()
    if not isinstance(result, dict):
        raise ValueError(f'Resposta inválida do CYPHERADM em /{endpoint}.')
    if result.get('success') is not True:
        raise ValueError(f'O CYPHERADM não confirmou a operação em /{endpoint}.')
    return result


def post_telemetry(metrics):
    return post_json('telemetry', metrics)


def send_alert(mac, description, severity='CRITICAL'):
    return post_json('alerts', {
        'mac': mac,
        'severity': severity,
        'description': description
    })
