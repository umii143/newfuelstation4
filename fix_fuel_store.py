import sys

file_path = r'e:\newfuelstation4\src\stores\fuelStore.ts'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
skip = False
for i, line in enumerate(lines):
    # Match the start of the problematic block
    if 'updatedNozzles.forEach(nozzle => {' in line and i + 1 < len(lines) and 'fsSet(sid, COLLECTIONS.NOZZLE_CONFIGS, nozzle.nozzleId, nozzle);' in lines[i+1]:
        new_lines.append(line)
        new_lines.append(lines[i+1])
        new_lines.append('                        });\n')
        new_lines.append('                    }\n')
        # Skip the original broken closure
        skip = True
        continue
    
    if skip:
        if '}' in line and 'get().resetWizard()' not in line:
            skip = False
            continue
        else:
            # If we don't find the closure, just keep going but this is a heuristic
            skip = False
            new_lines.append(line)
    else:
        new_lines.append(line)

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
