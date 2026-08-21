const Task = require("../models/task.model");
const paginationHelper = require("../../../helpers/pagination");
const SearchHelper = require("../../../helpers/search");

// [GET] /api/v1/tasks
module.exports.index = async (req, res) => {
  const find = {
    $or: [
      { createdBy: req.user.id },
      { listUser: req.user.id }
    ],
    deleted: false
  };

  // Loc theo trang thai
  if (req.query.status) {
    find.status = req.query.status;
  }

  // Tim kiem theo keyword
  const objectSearch = SearchHelper(req.query);
  if (objectSearch.regex) {
    find.title = objectSearch.regex;
  }


  // Pagination
  const countTasks = await Task.countDocuments(find);

  let objectPagination = paginationHelper(
    {
      limitItem: 4,
      currentPage: 1
    },
    req.query,
    countTasks
  );

  // End Pagination


  // khi gui len them param shortLey=shortValue
  const sort = {};
  if (req.query.sortKey && req.query.sortValue) {
    sort[req.query.sortKey] = req.query.sortValue;
  }

  const tasks = await Task.find(find)
    .sort(sort)
    .limit(objectPagination.limitItem)
    .skip(objectPagination.skip);

  res.json(tasks);
};

// [GET] /api/v1/tasks/detail/:id
module.exports.detail = async (req, res) => {
  try {
    const id = req.params.id;

    const task = await Task.findOne({
      _id: id,
      deleted: false
    });

    res.json(task);
  } catch (error) {
    res.json("Không tìm thấy!");
  }
};

// [PATCH] /api/v1/tasks/change-status/:id
module.exports.changeStatus = async (req, res) => {
  try {

    const id = req.params.id;

    //Muon lay data gui len thi dung thu vien body-parser
    const status = req.body.status;

    // Muon update database thi dung thu vien mongoose
    await Task.updateOne(
      { _id: id },
      {
        status: status
      }
    );

    res.json({
      code: 200,
      message: "Cập nhật trạng thái thành công",
    });
  } catch (error) {
    res.json({
      code: 400,
      message: "Lỗi hệ thống!",
    });
  }

};

// [PATCH] /api/v1/tasks/change-multi
module.exports.changeMulti = async (req, res) => {
  try {
    const { ids, key, value } = req.body;

    // Xử lý cập nhật nhiều bản ghi vào MongoDB
    switch (key) {
      case "status":
        // tim ban ghi nam trong ids
        await Task.updateMany(
          {
            _id: { $in: ids },
            deleted: false
          },
          {
            status: value
          }
        );
        res.json({
          code: 200,
          message: "Cập nhật trạng thái thành công!"
        });
        break;
      case "delete":
        await Task.updateMany(
          {
            _id: { $in: ids },
            deleted: false
          },
          {
            deleted: true,
            deletedAt: new Date()
          }
        );
        res.json({
          code: 200,
          message: "Xóa thành công!"
        });
        break;

      default:
        res.json({
          code: 400,
          message: "Không tồn tại!"
        });
        break;
    }


  } catch (error) {
    res.json({
      code: 400,
      message: "Không tồn tại!"
    });
  }
};

// [POST] /api/v1/tasks/create
module.exports.create = async (req, res) => {
  try {
    // Xac dinh ai la nguoi tao task
    req.body.createdBy = req.user.id;
    
    // lay ca list user thong qua req.body
    const task = new Task(req.body);
    const data = await task.save();

    res.json({
      code: 200,
      message: "Tạo thành công!",
      data: data
    });
  } catch (error) {
    res.json({
      code: 400,
      message: "Lỗi!"
    });
  }
};

// [PATCH] /api/v1/tasks/edit/:id
module.exports.edit = async (req, res) => {
  try {
    const id = req.params.id;

    await Task.updateOne(
      { _id: id },
      req.body
    );

    res.json({
      code: 200,
      message: "Cập nhật thành công!"
    });
  } catch (error) {
    res.json({
      code: 400,
      message: "Lỗi!"
    });
  }
};

// [DELETE] /api/v1/tasks/delete/:id
module.exports.delete = async (req, res) => {
  try {
    const id = req.params.id;

    await Task.updateOne(
      { _id: id },
      {
        deleted: true,
        deletedAt: new Date()
      }
    );

    res.json({
      code: 200,
      message: "Xóa thành công!"
    });
  } catch (error) {
    res.json({
      code: 400,
      message: "Lỗi!"
    });
  }
};


