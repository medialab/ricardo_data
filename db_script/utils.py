# coding=utf8
import subprocess
import os
#ensure dependency to csvkit
import csvkit

import sqlite3



def sqlitedatabase2csv(sqlitefilename,output_dir=os.path.join("out_data","csv_data")):
    conn=sqlite3.connect(sqlitefilename)
    c=conn.cursor()
    c.execute("""select name from sqlite_master where type='table' """)
    tablenames=[t[0] for t in c if t[0] !="sqlite_sequence"]
    return sqlitetables2csv(sqlitefilename,tablenames,output_dir)


def sqlitetables2csv(sqlitefilename,tablenames,output_dir=os.path.join("out_data","csv_data")):
    if not os.path.exists(output_dir):
        os.mkdir(output_dir)
    for table in tablenames:
        print "exporting %s table to csv"%table
        subprocess.call("""sql2csv --db "sqlite:///%s"    --query "select * from \`%s\`" > '%s.csv'"""%(sqlitefilename,table,os.path.join(output_dir,table)), shell=True)

def csv2sqlite(csv_path, sqlite_filename, sqlite_schema_filename=None):
    create_options=""
    if sqlite_schema_filename:
        conn=sqlite3.connect(sqlite_filename)
        c=conn.cursor()
        with open(sqlite_schema_filename,"r") as schema:
            c.executescript(schema.read())
        conn.commit()
        conn.close()
        create_options="--no-create"
    commandline="""csvsql --db sqlite:///%s %s --insert %s"""%(sqlite_filename,create_options,csv_path)
    subprocess.call(commandline,shell=True)
