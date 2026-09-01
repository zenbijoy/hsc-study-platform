from pathlib import Path
from app.parsers import parse_content_file
from app.dedupe import deduplicate


def test_tagged_formula(tmp_path: Path):
    p = tmp_path / "formulas.txt"
    p.write_text("""@subject Physics\n@chapter Motion\n\n::formula\ntitle: First equation\nformula: v=u+at\nimportance: 5\n""", encoding="utf-8")
    items = parse_content_file(p)
    assert len(items) == 1
    assert items[0].type == "formula"
    assert items[0].latex == "v=u+at"
    assert items[0].subject == "Physics"


def test_dedupe(tmp_path: Path):
    p = tmp_path / "q.jsonl"
    p.write_text('{"type":"cq","subject":"physics","chapter":"motion","question":"What is velocity?"}\n{"type":"cq","subject":"physics","chapter":"motion","question":"  What is velocity?  "}\n', encoding="utf-8")
    items = parse_content_file(p)
    out, dupes = deduplicate(items)
    assert len(out) == 1
    assert dupes == 1
