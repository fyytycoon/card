import baseComponent from '../helpers/baseComponent'
import classNames from '../helpers/classNames'

const defaults = {
    prefixCls: 'wux-dialog',
    title: '',
    content: '',
    buttons: [],
    verticalButtons: !1,
    resetOnClose: false,
    closable: false,
    mask: true,
    maskClosable: true,
    zIndex: 1000,
}

const defaultOptions = {
    onCancel() {},
    cancelText: '取消',
    cancelType: 'default',
    onConfirm() {},
    confirmText: '确定',
    confirmType: 'primary',
}

baseComponent({
    useFunc: true,
    data: defaults,
    computed: {
        classes: ['prefixCls, buttons, verticalButtons', function(prefixCls, btns, verticalButtons) {
            const prompt = `${prefixCls}__prompt`
            const input = `${prefixCls}__input`
            const buttons = classNames(`${prefixCls}__buttons`, {
                [`${prefixCls}__buttons--${verticalButtons ? 'vertical' : 'horizontal'}`]: true,
            })
            const button = btns.map((button) => {
                const wrap = classNames(`${prefixCls}__button`, {
                    [`${prefixCls}__button--${button.type || 'default'}`]: button.type || 'default',
                    [`${prefixCls}__button--bold`]: button.bold,
                    [`${prefixCls}__button--disabled`]: button.disabled,
                    [`${button.className}`]: button.className,
                })
                const hover = button.hoverClass && button.hoverClass !== 'default' ? button.hoverClass : `${prefixCls}__button--hover`

                return {
                    wrap,
                    hover,
                }
            })

            return {
                prompt,
                input,
                buttons,
                button,
            }
        }],
    },
    methods: {
        /**
         * 组件关闭时重置其内部数据
         */
        onClosed() {
            if (this.data.resetOnClose) {
                const params = {
                    ...this.$$mergeOptionsToData(defaults),
                    prompt: null,
                }

                this.$$setData(params)
            }
        },
        /**
         * 点击 x 或 mask 回调
         */
        onClose() {
            this.hide()
        },
        /**
         * 隐藏
         */
        hide(cb) {
            this.$$setData({ in: false })
            if (typeof cb === 'function') {
                cb.call(this)
            }
        },
        /**
         * 显示
         */
        show(opts = {}) {
            const options = this.$$mergeOptionsAndBindMethods(Object.assign({}, defaults, opts))
            this.$$setData({ in: true, ...options })
            this.originalButtons = options.buttons
            return this.hide.bind(this)
        },
        /**
         * 触发事件
         */
        runCallbacks(e, method) {
            const { index } = e.currentTarget.dataset
            const button = this.originalButtons[index]
            
            if (!button.disabled) {
                this.hide(() => typeof button[method] === 'function' && button[method](e))
            }
        },
        /**
         * 按钮点击事件
         */
        buttonTapped(e) {
            this.runCallbacks(e, 'onTap')
        },
        /**
         * 用户点击该按钮时，会返回获取到的用户信息，回调的detail数据与wx.getUserInfo返回的一致，open-type="getUserInfo"时有效
         */
        bindgetuserinfo(e) {
            this.runCallbacks(e, 'onGetUserInfo')
        },
        /**
         * 客服消息回调，open-type="contact"时有效
         */
        bindcontact(e) {
            this.runCallbacks(e, 'onContact')
        },
        /**
         * 获取用户手机号回调，open-type=getPhoneNumber时有效
         */
        bindgetphonenumber(e) {
            this.runCallbacks(e, 'onGotPhoneNumber')
        },
        /**
         * 在打开授权设置页后回调，open-type=openSetting时有效
         */
        bindopensetting(e) {
            this.runCallbacks(e, 'onOpenSetting')
        },
        /**
         * 当使用开放能力时，发生错误的回调，open-type=launchApp时有效
         */
        onError(e) {
            this.runCallbacks(e, 'onError')
        },
        /**
         * 当键盘输入时，触发 input 事件
         */
        bindinput(e) {
            this.$$setData({
                'prompt.response': e.detail.value,
            })
        },
        /**
         * 显示dialog组件
         * @param {Object} opts 配置项
         * @param {String} opts.title 提示标题
         * @param {String} opts.content 提示文本
         * @param {Boolean} opts.verticalButtons 是否显示垂直按钮布局
         * @param {Array} opts.buttons 按钮
         * @param {String} opts.buttons.text 按钮的文字
         * @param {String} opts.buttons.type 按钮的类型
         * @param {Boolean} opts.buttons.bold 是否加粗按钮的文字
         * @param {Function} opts.buttons.onTap 按钮的点击事件
         */
        open(opts = {}) {
            return this.show(opts)
        },
        /**
         * 显示dialog组件
         * @param {Object} opts 配置项
         * @param {String} opts.title 提示标题
         * @param {String} opts.content 提示文本
         * @param {String} opts.confirmText 确定按钮的文字，默认为"确定"
         * @param {String} opts.confirmType 确定按钮的类型
         * @param {Function} opts.onConfirm 确定按钮的点击事件
         */
        alert(opts = {}) {
            return this.open(Object.assign({
                buttons: [{
                    text: opts.confirmText || defaultOptions.confirmText,
                    type: opts.confirmType || defaultOptions.confirmType,
                    onTap: (e) => {
                        typeof opts.onConfirm === 'function' && opts.onConfirm(e)
                    },
                } ],
            }, opts))
        },
        /**
         * 显示dialog组件
         * @param {Object} opts 配置项
         * @param {String} opts.title 提示标题
         * @param {String} opts.content 提示文本
         * @param {String} opts.confirmText 确定按钮的文字，默认为"确定"
         * @param {String} opts.confirmType 确定按钮的类型
         * @param {Function} opts.onConfirm 确定按钮的点击事件
         * @param {String} opts.cancelText 取消按钮的文字，默认为"取消"
         * @param {String} opts.cancelType 取消按钮的类型
         * @param {Function} opts.onCancel 取消按钮的点击事件
         */
        confirm(opts = {}) {
            return this.open(Object.assign({
                buttons: [{
                    text: opts.cancelText || defaultOptions.cancelText,
                    type: opts.cancelType || defaultOptions.cancelType,
                    onTap: (e) => {
                        typeof opts.onCancel === 'function' && opts.onCancel(e)
                    },
                },
                {
                    text: opts.confirmText || defaultOptions.confirmText,
                    type: opts.confirmType || defaultOptions.confirmType,
                    onTap: (e) => {
                        typeof opts.onConfirm === 'function' && opts.onConfirm(e)
                    },
                }],
            }, opts))
        },
        /**
         * 显示dialog组件
         * @param {Object} opts 配置项
         * @param {String} opts.title 提示标题
         * @param {String} opts.content 提示文本
         * @param {String} opts.fieldtype input 的类型，有效值：text, number, idcard, digit
         * @param {Boolean} opts.password 是否是密码类型
         * @param {String} opts.defaultText 默认值
         * @param {String} opts.placeholder 输入框为空时占位符
         * @param {Number} opts.maxlength 最大输入长度，设置为 -1 的时候不限制最大长度
         * @param {String} opts.confirmText 确定按钮的文字，默认为"确定"
         * @param {String} opts.confirmType 确定按钮的类型
         * @param {Function} opts.onConfirm 确定按钮的点击事件
         * @param {String} opts.cancelText 取消按钮的文字，默认为"取消"
         * @param {String} opts.cancelType 取消按钮的类型
         * @param {Function} opts.onCancel 取消按钮的点击事件
         */
        prompt(opts = {}) {
            const prompt = {
                fieldtype: opts.fieldtype ? opts.fieldtype : 'text',
                password: !!opts.password,
                response: opts.defaultText ? opts.defaultText : '',
                placeholder: opts.placeholder ? opts.placeholder : '',
                maxlength: opts.maxlength ? parseInt(opts.maxlength) : '',
            }

            return this.open(Object.assign({
                prompt: prompt,
                buttons: [{
                    text: opts.cancelText || defaultOptions.cancelText,
                    type: opts.cancelType || defaultOptions.cancelType,
                    onTap: (e) => {
                        typeof opts.onCancel === 'function' && opts.onCancel(e)
                    },
                },
                {
                    text: opts.confirmText || defaultOptions.confirmText,
                    type: opts.confirmType || defaultOptions.confirmType,
                    onTap: (e) => {
                        typeof opts.onConfirm === 'function' && opts.onConfirm(e, this.data.prompt.response)
                    },
                }],
            }, opts))
        },
    },
})
