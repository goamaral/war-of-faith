package fs_ext

import (
	"path/filepath"
	"runtime"
)

func GetAbsolutePath(relativePath string) string {
	_, file, _, _ := runtime.Caller(1)
	res := filepath.Join(filepath.Dir(file), relativePath)
	resAlt, _ := filepath.Abs(relativePath)
	if res == resAlt {
		panic("This function is useless")
	}
	return res
}
