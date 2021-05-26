# coding=utf8
import re
import os
from unidecode import unidecode
import subprocess
# ensure dependency to csvkit
import csvkit
import sqlite3

# source slug generation
nonLetters = re.compile(r'\W', re.UNICODE)


def source_fields_slug(source): return ['editor' if source['source_category'] ==
                                        'website' else 'author', 'name', 'country', 'volume_date', 'volume_number', 'pages']


def source_fields_filename(source): return ['editor' if source['source_category']
                                            == 'website' else 'author', 'name', 'country', 'volume_date', 'volume_number']


def _generic_source_slugify(source, fields):
    def slug(s): return ''.join(
        [re.sub(nonLetters, '', w).capitalize() for w in s.split(' ')])
    return '_'.join(slug(source[f]) for f in fields if f in source and source[f] and slug(source[f]))


def source_slugify(source):
    return _generic_source_slugify(source, source_fields_slug(source))


def source_filename(source):
    return unidecode(_generic_source_slugify(source, source_fields_filename(source)))


def source_label(source, with_pages=True):
    fields = source_fields_slug(
        source) if not with_pages else source_fields_slug(source) + ['pages']
    return ', '.join([source[f] for f in (source_fields_slug(source)) if f in source and source[f] and source[f] != ''])


def ricslug(RICname): return re.sub(r"[ ()/.,\-']",
                                    "", re.sub("&", "_", RICname))


def sqlitedatabase2csv(sqlitefilename, output_dir="out_data"):
    conn = sqlite3.connect(sqlitefilename)
    c = conn.cursor()
    c.execute("""select name from sqlite_master where type='table' """)
    tablenames = [t[0] for t in c if t[0] != "sqlite_sequence"]
    return sqlitetables2csv(sqlitefilename, tablenames, output_dir)


def sqlitetables2csv(sqlitefilename, tablenames, output_dir="out_data"):
    if not os.path.exists(output_dir):
        os.mkdir(output_dir)
    for table in tablenames:
        print("exporting %s table to csv" % table)
        subprocess.call("""sql2csv --db "sqlite:///%s"    --query "select * from \`%s\`" > '%s.csv'""" %
                        (sqlitefilename, table, os.path.join(output_dir, table)), shell=True)


def csv2sqlite(csv_path, sqlite_filename, sqlite_schema_filename=None):
    create_options = ""
    if sqlite_schema_filename:
        conn = sqlite3.connect(sqlite_filename)
        c = conn.cursor()
        with open(sqlite_schema_filename, "r") as schema:
            c.executescript(schema.read())
        conn.commit()
        conn.close()
        create_options = "--no-create"
    commandline = """csvsql --db sqlite:///%s %s --insert %s""" % (
        sqlite_filename, create_options, csv_path)
    subprocess.call(commandline, shell=True)
