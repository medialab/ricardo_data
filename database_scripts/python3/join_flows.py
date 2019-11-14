import os


with open('../../data/flows.csv', 'w', encoding='utf8') as flow_one_f:
    headers_wrote = False
    for path, dirs, flow_files in os.walk('../../data/flows/'):
        for flow_file in flow_files:
            with open(os.path.join(path,flow_file), 'r', encoding='utf8') as f:
                if headers_wrote:
                    # remove headers
                    f.readline()
                flow_one_f.write(f.read())
                headers_wrote = True
