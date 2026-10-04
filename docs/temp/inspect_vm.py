import paramiko, sys
sys.stdout.reconfigure(encoding='utf-8')

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('192.168.0.105', username='doanhtu', password='123456')

def run(cmd):
    _, out, _ = ssh.exec_command(cmd)
    return out.read().decode('utf-8', errors='replace').strip()

print("=== DISKS (lsblk) ===")
print(run("lsblk -f"))

print("\n=== GROUPS (/etc/group) ===")
print(run("tail -n 15 /etc/group"))

print("\n=== SUDOERS /etc/sudoers.d ===")
print(run("echo 123456 | sudo -S ls -la /etc/sudoers.d/ 2>/dev/null"))

print("\n=== INSTALLED SERVICES / PORTS ===")
print(run("ss -tulpn"))

ssh.close()
