import re

from pypdf import PdfReader


_FORMATTED_LINE_PATTERN = re.compile(
    r'(?<!\d)(\d{5}\.?\d{5})\s+'
    r'(\d{5}\.?\d{6})\s+'
    r'(\d{5}\.?\d{6})\s+'
    r'(\d)\s+(\d{14})(?!\d)'
)
_UNFORMATTED_LINE_PATTERN = re.compile(r'(?<!\d)\d{47}(?!\d)')


def _find_line_digitavel(text):
    formatted = _FORMATTED_LINE_PATTERN.search(text)
    if formatted:
        return ''.join(re.sub(r'\D', '', field) for field in formatted.groups())

    unformatted = _UNFORMATTED_LINE_PATTERN.search(text)
    return unformatted.group(0) if unformatted else None


def _modulo_10_digit(digits):
    total = 0
    for position, character in enumerate(reversed(digits)):
        product = int(character) * (2 if position % 2 == 0 else 1)
        total += product // 10 + product % 10
    return (10 - total % 10) % 10


def _modulo_11_digit(digits):
    total = 0
    weight = 2
    for character in reversed(digits):
        total += int(character) * weight
        weight = 2 if weight == 9 else weight + 1

    digit = 11 - total % 11
    return 1 if digit in (0, 10, 11) else digit


def _has_valid_check_digits(line):
    fields_are_valid = (
        int(line[9]) == _modulo_10_digit(line[:9])
        and int(line[20]) == _modulo_10_digit(line[10:20])
        and int(line[31]) == _modulo_10_digit(line[21:31])
    )
    barcode = (
        line[:4] + line[32] + line[33:]
        + line[4:9] + line[10:20] + line[21:31]
    )
    barcode_is_valid = int(barcode[4]) == _modulo_11_digit(barcode[:4] + barcode[5:])
    return fields_are_valid and barcode_is_valid


def validate_boleto_pdf(pdf_path):
    reader = PdfReader(pdf_path)
    text = '\n'.join(page.extract_text() or '' for page in reader.pages)
    line_digitavel = _find_line_digitavel(text)

    if not line_digitavel:
        return {
            'valid': False,
            'line_digitavel': None,
            'message': 'Linha digitável bancária não encontrada no PDF.'
        }

    if line_digitavel[3] != '9' or not _has_valid_check_digits(line_digitavel):
        return {
            'valid': False,
            'line_digitavel': line_digitavel,
            'message': 'Linha digitável encontrada, mas com estrutura ou dígitos verificadores inválidos.'
        }

    return {
        'valid': True,
        'line_digitavel': line_digitavel,
        'message': 'Estrutura e dígitos verificadores da linha digitável válidos.'
    }
