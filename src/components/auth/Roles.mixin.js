export default {
  name: 'Roles',
  data () {
    return {
      // 表单中的所有数据
      tableData: [],
      // 添加角色，表单数据
      addRoleForm: {
        roleName: '',
        roleDesc: ''
      },
      // 打开添加角色对话框
      addRoleFormVisible: false,
      // 添加角色表单验证规则
      rules: {
        roleName: [
          { required: true, message: '角色名不能为空', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '描述不能为空', trigger: 'blur' }
        ]
      },
      // 编辑角色对话框
      editRoleFormVisible: false,
      // 编辑角色，表单数据
      editRoleForm: {
        roleName: '',
        roleDesc: ''
      },
      // 分配权限对话框
      allotRoleFormVisible: false,
      // 分配权限假数据
      allotRoleData: [],
      // 分配权限数据转换
      defaultProps: {
        children: 'children',
        label: 'authName'
      },
      // 默认展开所有的ID
      // rightsAllList: [],
      // 根据角色ID选中对应列表
      checkedList: [],
      // 用户权限树形表的ID
      userTreeId: ''
    };
  },
  mounted () {
    this.getData();
  },
  methods: {
    // 递归遍历数组中的对象????
    async getData () {
      const {data: {data, meta}} = await this.$http.get('roles');
      if (meta.status !== 200) return this.$message.error('获取角色列表失败');
      data.forEach(item => {
        item.child = item.children;
        delete item.children;
        item.child.forEach(item => {
          item.child = item.children;
          delete item.children;
          item.child.forEach(item => {
            item.child = item.children;
            delete item.children;
          });
        });
      });
      this.tableData = data;
    },
    // 添加角色
    addRole () {
      this.$refs.addRoleRules.validate(async valid => {
        // 如果验证成功则发送请求添加角色
        if (valid) {
          const {data: {meta}} = await this.$http.post('roles', this.addRoleForm);
          if (meta.status !== 201) return this.$message.error('添加角色失败');
          this.$message.success('添加角色成功');
          this.addRoleFormVisible = false;
          this.getData();
        }
      });
    },
    // 删除角色
    delRole (id) {
      this.$confirm('此操作将删除角色, 是否继续?', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        // 确认删除的话，则发送请求
        const {data: {meta}} = await this.$http.delete('roles/' + id);
        if (meta.status !== 200) return this.$message.error('删除用户失败');
        // 删除成功的话则更新列表
        this.getData();
        // 提示角色删除成功
        this.$message.success('删除角色成功');
      }).catch(() => {});
    },
    // 打开编辑角色对话框
    async editRole (id) {
      this.editRoleFormVisible = true;
      // 打开对话框的时候需要清除上一次的校验结果,但是需要在表单渲染完成之后
      this.$nextTick(() => {
        this.$refs.editRoleRules.resetFields();
      });
      // 根据ID查询角色信息
      const {data: {data, meta}} = await this.$http.get('roles/' + id);
      if (meta.status !== 200) return this.$message.error('获取角色信息失败');
      this.editRoleForm = data;
    },
    // 提交编辑角色
    async editSubmit () {
      const {data: {meta}} = await this.$http.put('roles/' + this.editRoleForm.roleId, {
        roleName: this.editRoleForm.roleName,
        roleDesc: this.editRoleForm.roleDesc
      });
      if (meta.status !== 200) return this.$message.error('编辑角色信息失败');
      this.$message.success('编辑角色成功');
      this.editRoleFormVisible = false;
      this.getData();
    },
    // 删除权限
    delRight (roleID, id, row) {
      this.$confirm('此操作将删除权限, 是否继续?', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        // 确认删除的话，则发送请求
        const {data: {data, meta}} = await this.$http.delete(`roles/${roleID}/rights/${id}`);
        if (meta.status !== 200) return this.$message.error('删除用户失败');
        // 删除成功的话则更新列表
        data.forEach(item => {
          item.child = item.children;
          delete item.children;
          item.child.forEach(item => {
            item.child = item.children;
            delete item.children;
          });
        });
        row.child = data;
        // 提示权限删除成功
        this.$message.success('删除权限成功');
      }).catch(() => {});
    },
    // 分配权限
    async allotRole (row) {
      // 打开之后需要把上一个用户的权限列表清空
      this.checkedList = [];
      // 打开后需要获取所有权限，并且渲染在页面中
      const {data: {data, meta}} = await this.$http.get('rights/tree');
      if (meta.status !== 200) return this.$message.error('获取权限列表失败');
      this.allotRoleData = data;
      // 默认展开所有权限列表
      // data.forEach(item => {
      //   this.rightsAllList.push(item.id);
      //   item.children.forEach(item => {
      //     this.rightsAllList.push(item.id);
      //     item.children.forEach(item => {});
      //     this.rightsAllList.push(item.id);
      //   });
      // });
      // 把用户ID保存上，用户树形表的修改
      this.userTreeId = row.id;
      // 获取当前用户的权限,只选择最后一层的节点的ID
      row.child.forEach(item => {
        // this.checkedList.push(item.id);
        item.child.forEach(item => {
          // this.checkedList.push(item.id);
          item.child.forEach(item => {
            this.checkedList.push(item.id);
          });
        });
      });
      // 先获取数据，再显示对话框
      this.allotRoleFormVisible = true;
    },
    // 确定分配权限
    async addAllRole () {
      // 这个方法可以获取选中的节点的ID值, 需要获取全选和半选按钮的ID值
      // console.log(this.$refs.tree.getCheckedKeys(), this.$refs.tree.getHalfCheckedKeys());
      const arr = [...this.$refs.tree.getCheckedKeys(), ...this.$refs.tree.getHalfCheckedKeys()];
      console.log(arr);
      const {data: {meta}} = await this.$http.post(`roles/${this.userTreeId}/rights`, {
        rids: arr.toString()
      });
      if (meta.status !== 200) return this.$message.error('修改用户权限失败');
      this.$message.success('修改用户权限成功');
      this.allotRoleFormVisible = false;
      this.getData();
    }
  }
};
