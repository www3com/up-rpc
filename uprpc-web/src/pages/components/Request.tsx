import React from "react";
import {Button, Card, Table, Tabs} from "antd";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/ext-language_tools"
import {Allotment} from "allotment";
import Stream from "@/pages/components/Stream";
import {VerticalAlignBottomOutlined} from "@ant-design/icons";
import {Method, Mode, RequestCache} from "@/types/types";

interface requestProps {
    run: boolean,
    method: Method,
    requestCache?: RequestCache,
    onChange?: (method: Method) => void,
    onPush?: (body: string) => void
}

export default ({run, method, requestCache, onChange, onPush}: requestProps) => {

    const aceChange = (value: string) => {
        if (onChange) {
            onChange({...method, requestBody: value})
        }
    }

    const columns = [
        {title: 'Key', dataIndex: 'key', key: 'key'},
        {title: 'Value', dataIndex: 'value', key: 'value'},
        {
            title: 'Action', dataIndex: 'action', key: 'action',
            render: (text: string, record: any) => (<a>编码</a>)
        }
    ];

    let isStream = method.mode == Mode.ServerStream || method.mode == Mode.BidirectionalStream;
    let pushButton = run && isStream ?
        <Button size='small' icon={<VerticalAlignBottomOutlined/>}>Push</Button> : '';
    return (
        <Allotment>
            <Tabs style={{height: "100%"}} animated={false}
                  tabBarExtraContent={<div style={{paddingRight: 10}}>{pushButton}</div>}>
                <Tabs.TabPane tab='Params' key='params'>
                    <AceEditor
                        style={{background: "#fff"}}
                        width={"100%"}
                        height='100%'
                        mode="json"
                        theme="textmate"
                        name="inputs"
                        fontSize={13}
                        cursorStart={2}
                        showPrintMargin={false}
                        showGutter
                        onChange={aceChange}
                        defaultValue={method.requestBody}
                        setOptions={{
                            useWorker: true,
                            displayIndentGuides: true
                        }}
                        tabSize={2}
                    />
                </Tabs.TabPane>
                <Tabs.TabPane tab='Metadata' key='metadata'>
                    <Table size='small' bordered={true} pagination={false} dataSource={method.requestMetadata}
                           columns={columns}/>
                </Tabs.TabPane>
            </Tabs>
            <Allotment.Pane visible={isStream}>
                <Card title='Request Stream' size={"small"} bordered={false}
                      bodyStyle={{height: '100%', overflow: "auto"}}>
                    <Stream value={requestCache?.streams}/>
                </Card>
            </Allotment.Pane>
        </Allotment>
    )
}