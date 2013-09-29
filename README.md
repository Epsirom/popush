Popush 部署文档
==============

# Linux

*stjh10@gmail.com*

*2 Jun 2013*

## 安装依赖

软件 | 版本 |
------------- | ----- |
Ubuntu Server | 13.04 |
Nginx *       | 1.5   |
Node          | 0.10  |
MongoDB       | 2.2   |
GCC           | 4.7   |
GDB           | 7.5   |
Python        | 2.7   |
Perl          | 5.14  |
Ruby          | 2.0   |
Lua           | 5.2   |
JDK           | 7.0   |

**请下载源码编译，并以默认方式安装在 /usr/local/nginx*

## 获取源码

	git clone https://github.com/qiankanglai/popush.git

## 创建主目录

	sudo cp -r popush /popush
	
## 设置主目录权限
	
	sudo chmod -R 777 /popush

## 部署

	cd /popush
	
	make deploy                  # 请确保能访问互联网

## 开启服务
	
	sudo service popush start    # 开启 websocket 服务器
	
	sudo service nginx start     # 开启 http 服务器

## 关闭服务
	
	sudo service popush stop     # 关闭 websocket 服务器
	
	sudo service nginx stop      # 关闭 http 服务器

# Windows

*chenhuarongzp@gmail.com*

*29 Sept 2013*

## 安装依赖

保证在以下版本软件的共同作用下，Popush能正确地运行。

软件 | 版本 |
--------------- | ---------- |
Windows 8       | Enterprise |
Nginx           | 1.5.5      |
Node *          | 0.10.17    |
MongoDB         | 2.4.6      |
MinGW32-gcc     | 4.8.1-3    |
MinGW32-gcc-g++ | 4.8.1-3    |
MinGW32-gdb     | 7.6.1-1    |
Python          | 3.3.2      |
Perl            | 5.16.3     |
Ruby            | 1.8.6      |
MinGW32-lua     | 5.2.0-1    |
JDK             | 1.7.0_25   |

**请特别注意，0.10.19版本的Node可能出现不可预料的问题，建议不要使用该版本。*

## 获取源码

	git clone https://github.com/qiankanglai/popush.git

## 设置POPUSH_PATH

	打开Popush文件夹中的win_path.txt，编辑该文件，其内容将作为Popush执行时临时创建的path环境变量。
	至少需要以下目录：MinGW/bin;jdk/bin;ruby/bin;python;perl/bin;nodejs/bin;
	如：D:\MinGW\bin;D:\Program Files\Java\jdk1.7.0_25\bin;D:\ruby\bin;D:\Python33;D:\Perl64\bin;D:\Program Files\nodejs\;

## Popush安装

	运行Popush文件夹中的win_make.bat，它会自动读取POPUSH_PATH，接着自动创建所需的目录，移植部分需要的linux命令（不完整移植），并安装所需的node package。

## 开启服务

	当依赖环境完全可用时，直接运行Popush文件夹中的win_start.bat，它会自动读取POPUSH_PATH，并启动app.js。
	若有需要，可设置系统服务。

## 关闭服务

	直接关闭即可。
