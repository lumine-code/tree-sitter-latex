from unittest import TestCase
import subprocess
import sys

import tree_sitter_latex
from tree_sitter import Language, Parser


class TestLanguage(TestCase):
    def test_can_parse_document(self):
        parser = Parser(Language(tree_sitter_latex.language()))
        source = b"\\documentclass{article}\n\\begin{document}\nHello, \\textbf{world}.\n\\end{document}\n"
        tree = parser.parse(source)
        self.assertFalse(tree.root_node.has_error)
        self.assertEqual(tree.root_node.type, "source_file")
        self.assertEqual(tree.root_node.end_byte, len(source))

    def test_incremental_parse_matches_fresh_parse(self):
        parser = Parser(Language(tree_sitter_latex.language()))
        before = b"\\begin{document}\nHello, world.\n\\end{document}\n"
        start = before.index(b"world")
        after = before[:start] + b"reader" + before[start + 5:]
        old_tree = parser.parse(before)
        self.assertFalse(old_tree.root_node.has_error)
        old_tree.edit(
            start_byte=start,
            old_end_byte=start + 5,
            new_end_byte=start + 6,
            start_point=(1, 7),
            old_end_point=(1, 12),
            new_end_point=(1, 13),
        )
        incremental = parser.parse(after, old_tree)
        fresh = parser.parse(after)

        def snapshot(tree):
            nodes = []
            pending = [tree.root_node]
            while pending:
                node = pending.pop()
                nodes.append((node.type, node.start_byte, node.end_byte,
                              tuple(node.start_point), tuple(node.end_point), node.child_count))
                pending.extend(reversed(node.children))
            return nodes

        self.assertFalse(incremental.root_node.has_error)
        self.assertFalse(fresh.root_node.has_error)
        self.assertEqual(snapshot(incremental), snapshot(fresh))

    def test_language_api_does_not_import_optional_runtime(self):
        result = subprocess.run(
            [sys.executable, "-c", "import sys; import tree_sitter_latex; assert tree_sitter_latex.language() is not None; assert 'tree_sitter' not in sys.modules"],
            capture_output=True,
            text=True,
            check=False,
        )
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
