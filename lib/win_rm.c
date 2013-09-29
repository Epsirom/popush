#include <string.h>

int main(int argc, char** argv)
{
	char cmdbuffer[127] = "rmdir /s /q ";
	int i, len;
	if ((argc <= 2) || (argc > 3))
	{
		return 1;
	}
	if (strcmp(argv[1], "-rf") != 0)
	{
		return 2;
	}
	len = strlen(argv[2]);
	for (i = 0; i < len; ++i)
	{
		if (argv[2][i] == '/')
		{
			argv[2][i] = '\\';
		}
	}
	strcat(cmdbuffer, argv[2]);
	system(cmdbuffer);
	return 0;
}