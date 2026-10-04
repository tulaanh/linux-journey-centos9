import paramiko

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('192.168.0.105', username='doanhtu', password='123456')

def run(cmd):
    _, out, _ = ssh.exec_command(cmd)
    return out.read().decode().strip()

print("=== BASH HISTORY ===")
print(run("cat ~/.bash_history"))

print("\n=== PASSWD USERS >= 1000 ===")
print(run("awk -F: '$3 >= 1000 {print $1, $3, $6, $7}' /etc/passwd"))

print("\n=== /applogs ===")
print(run("ls -la /applogs"))

print("\n=== DISKS ===")
print(run("lsblk"))

print("\n=== CRON / TIMERS ===")
print(run("crontab -l; ls -la /etc/cron*"))

ssh.close()
