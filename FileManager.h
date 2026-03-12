#ifndef FILEMANAGER_H
#define FILEMANAGER_H

#include <vector>
#include <string>
#include "task.h"

class FileManager {
public:
    static void saveTasks(const std::vector<Task>& tasks);
    static std::vector<Task> loadTasks();
};

#endif